// ─────────────────────────────────────────────────────────────────────────────
// Shop Pulse — actuals engine
//
// The plan model (forecast.ts) is forward-looking and driver-based. THIS module
// is the opposite: it reads what actually happened — real sales, real cost
// prices, real inventory — and evaluates the business to date, then projects the
// remaining plan months from the actual run-rate.
//
// Caveats baked into the data today:
//   • No expenses are logged, so operating cost = plan fixed opex + variable %.
//   • No purchase/restock ledger, so a bank-accurate cash balance isn't possible;
//     "estimated cash" = starting cash + capital in + (sales − operating costs).
// ─────────────────────────────────────────────────────────────────────────────

import { createSupabaseAdmin } from "./supabase-admin";
import { getPlan } from "./plan";
import { monthsInPlan, type HealthStatus } from "./forecast";
import { toDatetimeLocal } from "./utils";

const MONTH_NAMES = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthLabel(month: string): string {
	const [y, m] = month.split("-").map(Number);
	return `${MONTH_NAMES[m - 1]} '${String(y).slice(2)}`;
}

/** Helsinki calendar month ("YYYY-MM") of an instant — matches how times display. */
function helsinkiMonth(iso: string): string {
	return toDatetimeLocal(new Date(iso)).slice(0, 7);
}

const num = (v: unknown): number => {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
};

// ─── Shapes ──────────────────────────────────────────────────────────────────
export type ActualMonth = {
	month: string;
	label: string;
	isActual: boolean; // true = real recorded data, false = run-rate forecast
	isPartial: boolean; // current (in-progress) month
	revenue: number;
	cogs: number;
	grossProfit: number;
	grossMarginPct: number;
	opex: number;
	netProfit: number;
	units: number;
	orders: number;
};

export type Breakdown = {
	name: string;
	revenue: number;
	units: number;
	grossProfit: number;
};

export type ActualsReport = {
	months: ActualMonth[]; // full plan window: actual months + forecast months

	// ── Evaluation to date (real data only, including the partial current month)
	periodLabel: string;
	monthsElapsed: number;
	revenue: number;
	cogs: number;
	grossProfit: number;
	grossMarginPct: number;
	opex: number;
	netProfit: number;
	netMarginPct: number;
	units: number;
	orders: number;
	avgOrderValue: number;
	discountTotal: number;
	inventoryValueCost: number;
	inventoryValueRetail: number;
	activeProducts: number;
	estCashOnHand: number;
	currentMonthRevenue: number; // actual booked so far this (partial) month
	breakEvenMonthlyRevenue: number;
	avgMonthlyRevenue: number; // run-rate from completed months

	// ── Forecast (remaining window, run-rate based)
	forecastRevenue: number;
	forecastNetProfit: number;
	projectedWindowRevenue: number;
	projectedWindowNetProfit: number;

	// ── Breakdowns (to date)
	byPlatform: Breakdown[];
	byCategory: Breakdown[];
	topProducts: Breakdown[];

	health: HealthStatus;
	targetNetMarginPct: number;
};

type ItemRow = {
	qty: number;
	unit_price: number | string;
	line_discount: number | string;
	sale_id: string;
	products: { name: string; cost_price: number | string; categories: { name: string } | null } | null;
	sales: { occurred_at: string; platform: string | null } | null;
};
type SaleRow = { id: string; occurred_at: string; discount_total: number | string; platform: string | null };
type ProductRow = { cost_price: number | string; sell_price: number | string; current_stock: number; active: boolean };
type ExpenseRow = { amount: number | string; amount_after_vat: number | string; occurred_at: string };

// ─── The report ──────────────────────────────────────────────────────────────
export async function getActuals(): Promise<ActualsReport> {
	const db = createSupabaseAdmin();
	const { assumptions, plan } = await getPlan();

	const [itemsRes, salesRes, productsRes, expensesRes, settingsRes] = await Promise.all([
		db.from("sale_items").select(
			"qty, unit_price, line_discount, sale_id, products(name, cost_price, categories(name)), sales(occurred_at, platform)",
		),
		db.from("sales").select("id, occurred_at, discount_total, platform"),
		db.from("products").select("cost_price, sell_price, current_stock, active"),
		db.from("expenses").select("amount, amount_after_vat, occurred_at"),
		db.from("settings").select("target_net_margin").maybeSingle(),
	]);

	const items = (itemsRes.data ?? []) as unknown as ItemRow[];
	const sales = (salesRes.data ?? []) as unknown as SaleRow[];
	const products = (productsRes.data ?? []) as unknown as ProductRow[];
	const expenses = (expensesRes.data ?? []) as unknown as ExpenseRow[];
	const targetNetMarginPct = num((settingsRes.data as { target_net_margin: number } | null)?.target_net_margin ?? 20);

	const fixedOpex = assumptions.fixedOpexMonthly;
	const varPct = assumptions.variableOpexPctOfRevenue;
	const currentMonth = toDatetimeLocal(new Date()).slice(0, 7);
	const windowMonths = monthsInPlan(plan);

	// ── Aggregate recorded sale items by month (revenue net of line discount,
	//    COGS at the product's cost price, units).
	type MAgg = { revenue: number; cogs: number; units: number };
	const byMonth = new Map<string, MAgg>();
	for (const it of items) {
		const occ = it.sales?.occurred_at;
		if (!occ) continue;
		const m = helsinkiMonth(occ);
		const line = it.qty * num(it.unit_price) - num(it.line_discount);
		const cost = it.qty * num(it.products?.cost_price);
		const a = byMonth.get(m) ?? { revenue: 0, cogs: 0, units: 0 };
		a.revenue += line;
		a.cogs += cost;
		a.units += it.qty;
		byMonth.set(m, a);
	}

	const ordersByMonth = new Map<string, number>();
	let discountTotal = 0;
	for (const s of sales) {
		const m = helsinkiMonth(s.occurred_at);
		ordersByMonth.set(m, (ordersByMonth.get(m) ?? 0) + 1);
		discountTotal += num(s.discount_total);
	}

	const expensesByMonth = new Map<string, number>();
	for (const e of expenses) {
		const m = helsinkiMonth(e.occurred_at);
		expensesByMonth.set(m, (expensesByMonth.get(m) ?? 0) + num(e.amount_after_vat));
	}

	// ── Run-rate from completed months (before the current month, with activity).
	const completedKeys = windowMonths.filter((m) => m < currentMonth && (byMonth.get(m)?.revenue ?? 0) > 0);
	const completed = completedKeys.map((m) => ({ m, ...(byMonth.get(m) as MAgg) }));
	const nCompleted = completed.length || 1;
	const avgMonthlyRevenue = completed.reduce((s, c) => s + c.revenue, 0) / nCompleted;
	const avgUnits = Math.round(completed.reduce((s, c) => s + c.units, 0) / nCompleted);
	const avgOrders = Math.round(
		completedKeys.reduce((s, m) => s + (ordersByMonth.get(m) ?? 0), 0) / nCompleted,
	);
	const completedRev = completed.reduce((s, c) => s + c.revenue, 0);
	const completedCogs = completed.reduce((s, c) => s + c.cogs, 0);
	const runRateMarginRatio = completedRev > 0 ? (completedRev - completedCogs) / completedRev : 0;

	// ── Build the full-window month series: actuals (past) + forecast (now→end).
	const months: ActualMonth[] = windowMonths.map((m) => {
		const isForecast = m >= currentMonth;
		if (!isForecast) {
			const a = byMonth.get(m) ?? { revenue: 0, cogs: 0, units: 0 };
			const grossProfit = a.revenue - a.cogs;
			const opex = fixedOpex + (varPct / 100) * a.revenue + (expensesByMonth.get(m) ?? 0);
			return {
				month: m, label: monthLabel(m), isActual: true, isPartial: false,
				revenue: a.revenue, cogs: a.cogs, grossProfit,
				grossMarginPct: a.revenue > 0 ? (grossProfit / a.revenue) * 100 : 0,
				opex, netProfit: grossProfit - opex, units: a.units, orders: ordersByMonth.get(m) ?? 0,
			};
		}
		const revenue = avgMonthlyRevenue;
		const grossProfit = revenue * runRateMarginRatio;
		const opex = fixedOpex + (varPct / 100) * revenue;
		return {
			month: m, label: monthLabel(m), isActual: false, isPartial: m === currentMonth,
			revenue, cogs: revenue - grossProfit, grossProfit,
			grossMarginPct: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
			opex, netProfit: grossProfit - opex, units: avgUnits, orders: avgOrders,
		};
	});

	// ── Evaluation to date: every real data point, incl. the partial current month.
	let revenue = 0, cogs = 0, units = 0;
	for (const a of byMonth.values()) {
		revenue += a.revenue;
		cogs += a.cogs;
		units += a.units;
	}
	const grossProfit = revenue - cogs;
	const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
	const orders = sales.length;
	const avgOrderValue = orders > 0 ? revenue / orders : 0;

	const elapsedMonths = windowMonths.filter((m) => m <= currentMonth);
	const loggedExpenses = expenses.reduce((s, e) => s + num(e.amount_after_vat), 0);
	const opex = fixedOpex * elapsedMonths.length + (varPct / 100) * revenue + loggedExpenses;
	const netProfit = grossProfit - opex;
	const netMarginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0;

	const inventoryValueCost = products.reduce((s, p) => s + num(p.cost_price) * p.current_stock, 0);
	const inventoryValueRetail = products.reduce((s, p) => s + num(p.sell_price) * p.current_stock, 0);
	const activeProducts = products.filter((p) => p.active).length;

	const capitalToDate = assumptions.capitalInjections
		.filter((c) => c.month >= plan.startMonth && c.month <= currentMonth)
		.reduce((s, c) => s + c.amount, 0);
	const estCashOnHand = assumptions.startingCash + capitalToDate + (revenue - opex);

	// Contribution-margin break-even: fixed costs ÷ (gross margin% − variable opex%).
	const contributionRatio = runRateMarginRatio - varPct / 100;
	const breakEvenMonthlyRevenue = contributionRatio > 0 ? fixedOpex / contributionRatio : Infinity;

	const currentMonthRevenue = byMonth.get(currentMonth)?.revenue ?? 0;

	// ── Forecast + projected window totals (forecast covers current→end months).
	const forecastMonths = months.filter((m) => !m.isActual);
	const actualMonths = months.filter((m) => m.isActual);
	const forecastRevenue = forecastMonths.reduce((s, m) => s + m.revenue, 0);
	const forecastNetProfit = forecastMonths.reduce((s, m) => s + m.netProfit, 0);
	const projectedWindowRevenue = actualMonths.reduce((s, m) => s + m.revenue, 0) + forecastRevenue;
	const projectedWindowNetProfit = actualMonths.reduce((s, m) => s + m.netProfit, 0) + forecastNetProfit;

	// ── Breakdowns to date.
	const byPlatform = aggregate(items, (it) => it.sales?.platform || "Unknown");
	const byCategory = aggregate(items, (it) => it.products?.categories?.name || "Uncategorized");
	const topProducts = aggregate(items, (it) => it.products?.name || "Unknown").slice(0, 6);

	const firstMonth = [...byMonth.keys()].sort()[0] ?? plan.startMonth;
	const periodLabel = `${monthLabel(firstMonth)} – ${monthLabel(currentMonth)}`;

	return {
		months,
		periodLabel,
		monthsElapsed: elapsedMonths.length,
		revenue, cogs, grossProfit, grossMarginPct,
		opex, netProfit, netMarginPct,
		units, orders, avgOrderValue, discountTotal,
		inventoryValueCost, inventoryValueRetail, activeProducts,
		estCashOnHand, currentMonthRevenue, breakEvenMonthlyRevenue, avgMonthlyRevenue,
		forecastRevenue, forecastNetProfit, projectedWindowRevenue, projectedWindowNetProfit,
		byPlatform, byCategory, topProducts,
		health: verdict({ estCashOnHand, netProfit, netMarginPct, targetNetMarginPct }),
		targetNetMarginPct,
	};
}

function aggregate(items: ItemRow[], keyFn: (it: ItemRow) => string): Breakdown[] {
	const map = new Map<string, Breakdown>();
	for (const it of items) {
		const name = keyFn(it);
		const revenue = it.qty * num(it.unit_price) - num(it.line_discount);
		const grossProfit = revenue - it.qty * num(it.products?.cost_price);
		const b = map.get(name) ?? { name, revenue: 0, units: 0, grossProfit: 0 };
		b.revenue += revenue;
		b.units += it.qty;
		b.grossProfit += grossProfit;
		map.set(name, b);
	}
	return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

function verdict(x: {
	estCashOnHand: number;
	netProfit: number;
	netMarginPct: number;
	targetNetMarginPct: number;
}): HealthStatus {
	if (x.estCashOnHand < 0) return "unhealthy";
	if (x.netProfit <= 0) return "normal";
	if (x.netMarginPct >= x.targetNetMarginPct) return "healthy";
	return "normal";
}
