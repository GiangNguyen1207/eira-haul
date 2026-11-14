import { createSupabaseAdmin } from "./supabase-admin";
import { type Assumptions, type PlanConfig } from "./forecast";

export type PlanFormValues = {
	startingCash: number;
	openingInventory: number;
	fixedOpexMonthly: number;
	variableOpexPct: number;
	inventoryCoverageMonths: number;
	startMonth: string;
	endMonth: string;
	productGroups: { name: string; baseMonthlyRevenue: number; monthlyGrowthPct: number; grossMarginPct: number }[];
	capitalInjections: { month: string; amount: number; source: string }[];
};

export async function checkHasPlan(): Promise<boolean> {
	const db = createSupabaseAdmin();
	const { data } = await db.from("plan_assumptions").select("id").maybeSingle();
	return !!data;
}

function blankPlan(): { assumptions: Assumptions; plan: PlanConfig } {
	const now = new Date();
	const startMonth = `${now.getFullYear()}-01`;
	const endMonth = `${now.getFullYear()}-12`;
	return {
		assumptions: {
			name: "My plan",
			kind: "base",
			startingCash: 0,
			openingInventory: 0,
			capitalInjections: [],
			productGroups: [],
			fixedOpexMonthly: 0,
			variableOpexPctOfRevenue: 0,
			inventoryCoverageMonths: 1,
		},
		plan: { startMonth, endMonth },
	};
}

export async function getPlan(): Promise<{ assumptions: Assumptions; plan: PlanConfig }> {
	const db = createSupabaseAdmin();

	const [{ data: a }, { data: groups }, { data: injections }] = await Promise.all([
		db.from("plan_assumptions").select("*").maybeSingle(),
		db.from("plan_product_groups").select("*").order("sort_order"),
		db.from("plan_capital_injections").select("*").order("month"),
	]);

	if (!a) {
		return blankPlan();
	}

	return {
		assumptions: {
			name: a.name,
			kind: "base",
			startingCash: Number(a.starting_cash),
			openingInventory: Number(a.opening_inventory),
			fixedOpexMonthly: Number(a.fixed_opex_monthly),
			variableOpexPctOfRevenue: Number(a.variable_opex_pct),
			inventoryCoverageMonths: Number(a.inventory_coverage_months),
			productGroups: (groups ?? []).map((g) => ({
				name: g.name,
				baseMonthlyRevenue: Number(g.base_monthly_revenue),
				monthlyGrowthPct: Number(g.monthly_growth_pct),
				grossMarginPct: Number(g.gross_margin_pct),
			})),
			capitalInjections: (injections ?? []).map((c) => ({
				month: c.month,
				amount: Number(c.amount),
				source: c.source,
			})),
		},
		plan: {
			startMonth: a.start_month,
			endMonth: a.end_month,
		},
	};
}

export async function getPlanFormValues(): Promise<PlanFormValues> {
	const { assumptions, plan } = await getPlan();
	return {
		startingCash: assumptions.startingCash,
		openingInventory: assumptions.openingInventory,
		fixedOpexMonthly: assumptions.fixedOpexMonthly,
		variableOpexPct: assumptions.variableOpexPctOfRevenue,
		inventoryCoverageMonths: assumptions.inventoryCoverageMonths,
		startMonth: plan.startMonth,
		endMonth: plan.endMonth,
		productGroups: assumptions.productGroups,
		capitalInjections: assumptions.capitalInjections,
	};
}
