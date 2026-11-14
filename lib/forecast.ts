// ─────────────────────────────────────────────────────────────────────────────
// Shop Pulse — forecasting engine
//
// Pure, driver-based financial model. You give it assumptions; it computes all
// six statements for every month of the plan plus the headline KPIs.
//
// The thing that matters most (per the owner): P&L and Cash Flow are SEPARATE.
// A month can show Net Profit while Closing Cash falls — because cash gets
// locked up in inventory. The cash bridge below makes that explicit:
//
//     Operating Cash = Net Profit − Increase in Inventory
//     Closing Cash   = Opening Cash + Operating Cash + Capital injected
// ─────────────────────────────────────────────────────────────────────────────

export type ScenarioKind = "base" | "best" | "worst";
export type HealthStatus = "healthy" | "normal" | "unhealthy";

export type ProductGroup = {
	name: string;
	baseMonthlyRevenue: number; // revenue in the first plan month
	monthlyGrowthPct: number; // compounding month-over-month, e.g. 3 = +3%/mo
	grossMarginPct: number; // e.g. 45 = 45% gross margin
};

export type Assumptions = {
	name: string;
	kind: ScenarioKind;
	startingCash: number; // cash on hand at the start of the plan
	openingInventory: number; // inventory value at the start of the plan
	capitalInjections: { month: string; amount: number; source: string }[];
	productGroups: ProductGroup[];
	fixedOpexMonthly: number; // rent + salaries + utilities, etc.
	variableOpexPctOfRevenue: number; // scales with revenue, e.g. 5 = 5%
	inventoryCoverageMonths: number; // months of COGS held as stock (drives cash lock-up)
};

export type PlanConfig = {
	startMonth: string; // "YYYY-MM"
	endMonth: string; // "YYYY-MM" (inclusive)
};

// Full 2026 calendar year, ending 31/12/2026. Change startMonth to shorten.
export const PLAN: PlanConfig = { startMonth: "2026-01", endMonth: "2026-12" };

// ─── Per-month computed line (one row of the model) ──────────────────────────
export type MonthLine = {
	month: string;
	label: string;
	// P&L
	revenue: number;
	cogs: number;
	grossProfit: number;
	grossMarginPct: number;
	opexFixed: number;
	opexVariable: number;
	opex: number;
	netProfit: number;
	cumulativeNetProfit: number;
	// Inventory
	openingInventory: number;
	endingInventory: number;
	deltaInventory: number;
	purchases: number; // cash cost of goods bought = COGS + Δinventory
	// Cash (the bridge)
	openingCash: number;
	operatingCash: number; // netProfit − Δinventory
	capital: number;
	netCashFlow: number; // operatingCash + capital
	closingCash: number;
};

export type RevenueByGroupLine = {
	month: string;
	label: string;
	groups: { name: string; amount: number }[];
	total: number;
};

export type ForecastKpis = {
	totalRevenue: number;
	totalGrossProfit: number;
	avgGrossMarginPct: number;
	totalNetProfit: number;
	endingCash: number;
	endingInventory: number;
	cashBurnRateMonthly: number; // avg monthly operating cash OUTFLOW (0 if cash-generative)
	breakEvenRevenueMonthly: number; // revenue/month needed to cover fixed costs
	breakEvenMonthLabel: string | null; // first month cumulative P&L turns positive
	additionalCapitalRequired: number; // extra capital so cash never goes < 0
	health: HealthStatus;
};

export type Forecast = {
	name: string;
	kind: ScenarioKind;
	months: MonthLine[];
	revenueByGroup: RevenueByGroupLine[];
	kpis: ForecastKpis;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function monthsInPlan(plan: PlanConfig = PLAN): string[] {
	const [sy, sm] = plan.startMonth.split("-").map(Number);
	const [ey, em] = plan.endMonth.split("-").map(Number);
	const out: string[] = [];
	let y = sy;
	let m = sm;
	while (y < ey || (y === ey && m <= em)) {
		out.push(`${y}-${String(m).padStart(2, "0")}`);
		m += 1;
		if (m > 12) {
			m = 1;
			y += 1;
		}
	}
	return out;
}

function monthLabel(month: string): string {
	const [y, m] = month.split("-").map(Number);
	return `${MONTH_NAMES[m - 1]} '${String(y).slice(2)}`;
}

// ─── The model ───────────────────────────────────────────────────────────────
export function compute(a: Assumptions, plan: PlanConfig = PLAN): Forecast {
	const monthKeys = monthsInPlan(plan);
	const lines: MonthLine[] = [];
	const revenueByGroup: RevenueByGroupLine[] = [];

	let prevInventory = a.openingInventory;
	let prevCash = a.startingCash;
	let cumulativeNetProfit = 0;

	monthKeys.forEach((month, i) => {
		// Revenue per product group (compounding growth) and blended COGS.
		let revenue = 0;
		let cogs = 0;
		const groups = a.productGroups.map((g) => {
			const amount =
				g.baseMonthlyRevenue * (1 + g.monthlyGrowthPct / 100) ** i;
			revenue += amount;
			cogs += amount * (1 - g.grossMarginPct / 100);
			return { name: g.name, amount };
		});

		const grossProfit = revenue - cogs;
		const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

		const opexVariable = (a.variableOpexPctOfRevenue / 100) * revenue;
		const opexFixed = a.fixedOpexMonthly;
		const opex = opexFixed + opexVariable;

		const netProfit = grossProfit - opex;
		cumulativeNetProfit += netProfit;

		// Inventory policy: hold N months of COGS → this is where cash gets stuck.
		const endingInventory = a.inventoryCoverageMonths * cogs;
		const deltaInventory = endingInventory - prevInventory;
		const purchases = cogs + deltaInventory;

		// Cash bridge.
		const capital = a.capitalInjections
			.filter((c) => c.month === month)
			.reduce((s, c) => s + c.amount, 0);
		const operatingCash = netProfit - deltaInventory;
		const netCashFlow = operatingCash + capital;
		const openingCash = prevCash;
		const closingCash = openingCash + netCashFlow;

		lines.push({
			month,
			label: monthLabel(month),
			revenue,
			cogs,
			grossProfit,
			grossMarginPct,
			opexFixed,
			opexVariable,
			opex,
			netProfit,
			cumulativeNetProfit,
			openingInventory: prevInventory,
			endingInventory,
			deltaInventory,
			purchases,
			openingCash,
			operatingCash,
			capital,
			netCashFlow,
			closingCash,
		});
		revenueByGroup.push({ month, label: monthLabel(month), groups, total: revenue });

		prevInventory = endingInventory;
		prevCash = closingCash;
	});

	return { name: a.name, kind: a.kind, months: lines, revenueByGroup, kpis: kpis(a, lines) };
}

function kpis(a: Assumptions, lines: MonthLine[]): ForecastKpis {
	const sum = (pick: (l: MonthLine) => number) =>
		lines.reduce((s, l) => s + pick(l), 0);

	const totalRevenue = sum((l) => l.revenue);
	const totalGrossProfit = sum((l) => l.grossProfit);
	const totalNetProfit = sum((l) => l.netProfit);
	const avgGrossMarginPct =
		totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

	const last = lines[lines.length - 1];
	const endingCash = last?.closingCash ?? a.startingCash;
	const endingInventory = last?.endingInventory ?? a.openingInventory;

	// Burn = average monthly operating cash OUTFLOW (financing excluded).
	const avgOperatingCash = lines.length
		? sum((l) => l.operatingCash) / lines.length
		: 0;
	const cashBurnRateMonthly = avgOperatingCash < 0 ? -avgOperatingCash : 0;

	// Contribution-margin break-even: fixed costs ÷ (gross margin% − variable opex%).
	const contributionRatio =
		(avgGrossMarginPct - a.variableOpexPctOfRevenue) / 100;
	const breakEvenRevenueMonthly =
		contributionRatio > 0 ? a.fixedOpexMonthly / contributionRatio : Infinity;

	const beLine = lines.find((l) => l.cumulativeNetProfit >= 0);
	const breakEvenMonthLabel = beLine ? beLine.label : null;

	// Additional capital = depth of the deepest cash trough below zero.
	const minCash = lines.length
		? Math.min(...lines.map((l) => l.closingCash))
		: a.startingCash;
	const additionalCapitalRequired = minCash < 0 ? -minCash : 0;

	return {
		totalRevenue,
		totalGrossProfit,
		avgGrossMarginPct,
		totalNetProfit,
		endingCash,
		endingInventory,
		cashBurnRateMonthly,
		breakEvenRevenueMonthly,
		breakEvenMonthLabel,
		additionalCapitalRequired,
		health: verdict({
			additionalCapitalRequired,
			endingCash,
			totalNetProfit,
			cashBurnRateMonthly,
		}),
	};
}

function verdict(x: {
	additionalCapitalRequired: number;
	endingCash: number;
	totalNetProfit: number;
	cashBurnRateMonthly: number;
}): HealthStatus {
	if (x.additionalCapitalRequired > 0 || x.endingCash < 0) return "unhealthy";
	if (x.totalNetProfit <= 0 || x.cashBurnRateMonthly > 0) return "normal";
	return "healthy";
}

// ─────────────────────────────────────────────────────────────────────────────
// Default scenarios — realistic placeholders for a stationery shop (EUR).
// Edit these (or, later, the Settings page) to match your real numbers.
// ─────────────────────────────────────────────────────────────────────────────
const BASE_GROUPS: ProductGroup[] = [
	{ name: "Pens & Writing", baseMonthlyRevenue: 3500, monthlyGrowthPct: 3, grossMarginPct: 45 },
	{ name: "Notebooks & Paper", baseMonthlyRevenue: 3000, monthlyGrowthPct: 2, grossMarginPct: 42 },
	{ name: "Art Supplies", baseMonthlyRevenue: 1800, monthlyGrowthPct: 4, grossMarginPct: 52 },
	{ name: "Office & Misc", baseMonthlyRevenue: 1200, monthlyGrowthPct: 1, grossMarginPct: 38 },
];

function tweakGroups(delta: { growth: number; margin: number }): ProductGroup[] {
	return BASE_GROUPS.map((g) => ({
		...g,
		monthlyGrowthPct: g.monthlyGrowthPct + delta.growth,
		grossMarginPct: g.grossMarginPct + delta.margin,
	}));
}

export const DEFAULT_SCENARIOS: Record<ScenarioKind, Assumptions> = {
	base: {
		name: "Base case",
		kind: "base",
		startingCash: 10000,
		openingInventory: 8000,
		capitalInjections: [{ month: "2026-01", amount: 20000, source: "Owner equity" }],
		productGroups: BASE_GROUPS,
		fixedOpexMonthly: 3500,
		variableOpexPctOfRevenue: 5,
		inventoryCoverageMonths: 2,
	},
	best: {
		name: "Best case",
		kind: "best",
		startingCash: 10000,
		openingInventory: 8000,
		capitalInjections: [{ month: "2026-01", amount: 20000, source: "Owner equity" }],
		productGroups: tweakGroups({ growth: 2, margin: 3 }),
		fixedOpexMonthly: 3500,
		variableOpexPctOfRevenue: 5,
		inventoryCoverageMonths: 2,
	},
	worst: {
		name: "Worst case",
		kind: "worst",
		startingCash: 10000,
		openingInventory: 8000,
		capitalInjections: [{ month: "2026-01", amount: 20000, source: "Owner equity" }],
		productGroups: tweakGroups({ growth: -2, margin: -4 }),
		fixedOpexMonthly: 3800,
		variableOpexPctOfRevenue: 6,
		inventoryCoverageMonths: 3, // holds more stock → more cash locked up
	},
};

export const SCENARIO_KINDS: ScenarioKind[] = ["base", "best", "worst"];

export function computeScenario(kind: ScenarioKind, plan: PlanConfig = PLAN): Forecast {
	return compute(DEFAULT_SCENARIOS[kind], plan);
}

export function computeAllScenarios(plan: PlanConfig = PLAN): Forecast[] {
	return SCENARIO_KINDS.map((k) => computeScenario(k, plan));
}
