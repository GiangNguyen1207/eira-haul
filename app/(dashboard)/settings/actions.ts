"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { PlanFormValues } from "@/lib/plan";

export async function seedFromActuals(): Promise<PlanFormValues | { error: string }> {
	const db = createSupabaseAdmin();

	const [itemsRes, productsRes, expensesRes, settingsRes] = await Promise.all([
		db.from("sale_items").select(
			"qty, unit_price, line_discount, products(cost_price, categories(name)), sales(occurred_at)",
		),
		db.from("products").select("cost_price, current_stock"),
		db.from("expenses").select("amount_after_vat, occurred_at"),
		db.from("settings").select("cash_on_hand").maybeSingle(),
	]);

	if (itemsRes.error) return { error: itemsRes.error.message };

	type ItemRow = {
		qty: number;
		unit_price: number;
		line_discount: number;
		products: { cost_price: number; categories: { name: string } | null } | null;
		sales: { occurred_at: string } | null;
	};
	const items = (itemsRes.data ?? []) as unknown as ItemRow[];
	const products = (productsRes.data ?? []) as { cost_price: number; current_stock: number }[];
	const expenses = (expensesRes.data ?? []) as { amount_after_vat: number; occurred_at: string }[];
	const cashOnHand = Number((settingsRes.data as { cash_on_hand: number } | null)?.cash_on_hand ?? 0);

	// Opening inventory = current stock value at cost
	const openingInventory = products.reduce((s, p) => s + Number(p.cost_price) * Number(p.current_stock), 0);

	// Count distinct months with sales activity
	const saleMonths = new Set<string>();
	for (const item of items) {
		const occ = item.sales?.occurred_at;
		if (occ) saleMonths.add(occ.slice(0, 7));
	}
	const activeMonths = Math.max(saleMonths.size, 1);

	// Per-category: aggregate revenue and COGS across all sale_items
	const catMap = new Map<string, { revenue: number; cogs: number }>();
	for (const item of items) {
		const name = item.products?.categories?.name ?? "Uncategorized";
		const revenue = Number(item.qty) * Number(item.unit_price) - Number(item.line_discount);
		const cogs = Number(item.qty) * Number(item.products?.cost_price ?? 0);
		const existing = catMap.get(name) ?? { revenue: 0, cogs: 0 };
		existing.revenue += revenue;
		existing.cogs += cogs;
		catMap.set(name, existing);
	}

	const productGroups = [...catMap.entries()]
		.sort((a, b) => b[1].revenue - a[1].revenue)
		.map(([name, { revenue, cogs }]) => ({
			name,
			baseMonthlyRevenue: Math.round((revenue / activeMonths) * 100) / 100,
			monthlyGrowthPct: 0,
			grossMarginPct: revenue > 0 ? Math.round(((revenue - cogs) / revenue) * 1000) / 10 : 0,
		}));

	// Fixed opex: average monthly expenses from logged data
	const expenseMonths = new Set(expenses.map((e) => e.occurred_at?.slice(0, 7)).filter(Boolean)).size;
	const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount_after_vat ?? 0), 0);
	const fixedOpexMonthly =
		expenseMonths > 0 ? Math.round((totalExpenses / expenseMonths) * 100) / 100 : 0;

	// Plan window: earliest sale month (or Jan of current year) → Dec of current year
	const now = new Date();
	const earliestSale = [...saleMonths].sort()[0];
	const startMonth = earliestSale ?? `${now.getFullYear()}-01`;
	const endMonth = `${now.getFullYear()}-12`;

	return {
		startingCash: Math.round(cashOnHand * 100) / 100,
		openingInventory: Math.round(openingInventory * 100) / 100,
		fixedOpexMonthly,
		variableOpexPct: 0,
		inventoryCoverageMonths: 1,
		startMonth,
		endMonth,
		productGroups,
		capitalInjections: [],
	};
}

export async function savePlan(data: PlanFormValues): Promise<{ error?: string }> {
	const db = createSupabaseAdmin();

	const { error: aErr } = await db.from("plan_assumptions").upsert({
		id: true,
		start_month: data.startMonth,
		end_month: data.endMonth,
		starting_cash: data.startingCash,
		opening_inventory: data.openingInventory,
		fixed_opex_monthly: data.fixedOpexMonthly,
		variable_opex_pct: data.variableOpexPct,
		inventory_coverage_months: data.inventoryCoverageMonths,
		updated_at: new Date().toISOString(),
	});
	if (aErr) return { error: aErr.message };

	// Replace product groups
	await db.from("plan_product_groups").delete().not("id", "is", null);
	const { error: gErr } = await db.from("plan_product_groups").insert(
		data.productGroups.map((g, i) => ({
			name: g.name,
			base_monthly_revenue: g.baseMonthlyRevenue,
			monthly_growth_pct: g.monthlyGrowthPct,
			gross_margin_pct: g.grossMarginPct,
			sort_order: i,
		})),
	);
	if (gErr) return { error: gErr.message };

	// Replace capital injections
	await db.from("plan_capital_injections").delete().not("id", "is", null);
	if (data.capitalInjections.length > 0) {
		const { error: cErr } = await db.from("plan_capital_injections").insert(
			data.capitalInjections.map((c) => ({
				month: c.month,
				amount: c.amount,
				source: c.source,
			})),
		);
		if (cErr) return { error: cErr.message };
	}

	revalidatePath("/", "layout");
	return {};
}
