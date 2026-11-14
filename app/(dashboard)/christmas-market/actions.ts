"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type MarketplaceItem = {
	id: string;
	name: string;
	singlePrice: number;
	pairTotal: number;
	cogsPerUnit: number;
	worstCupsPerDay: number;
	normalCupsPerDay: number;
	bestCupsPerDay: number;
	sortOrder: number;
};

export type MarketplacePlanValues = {
	name: string;
	days: number;
	worstPairPct: number;   // % of cups sold as a pair deal
	normalPairPct: number;
	bestPairPct: number;
	kioskCost: number;
	electricityCost: number;
	equipmentCost: number;
	otherCost: number;
	items: MarketplaceItem[];
};

const DEFAULTS: MarketplacePlanValues = {
	name: "",
	days: 2,
	worstPairPct: 10,
	normalPairPct: 25,
	bestPairPct: 35,
	kioskCost: 0,
	electricityCost: 0,
	equipmentCost: 0,
	otherCost: 0,
	items: [],
};

export async function getMarketplacePlan(): Promise<MarketplacePlanValues> {
	const db = createSupabaseAdmin();
	const [planRes, itemsRes] = await Promise.all([
		db.from("marketplace_plan").select("*").maybeSingle(),
		db.from("marketplace_plan_items").select("*").order("sort_order"),
	]);

	if (!planRes.data) return DEFAULTS;

	const plan = planRes.data;
	const items: MarketplaceItem[] = (itemsRes.data ?? []).map((r) => ({
		id:               r.id,
		name:             r.name,
		singlePrice:      Number(r.single_price),
		pairTotal:        Number(r.pair_total),
		cogsPerUnit:      Number(r.cogs_per_unit),
		worstCupsPerDay:  Number(r.worst_cups_per_day),
		normalCupsPerDay: Number(r.normal_cups_per_day),
		bestCupsPerDay:   Number(r.best_cups_per_day),
		sortOrder:        Number(r.sort_order),
	}));

	return {
		name:            plan.name,
		days:            Number(plan.days),
		worstPairPct:    Number(plan.worst_pair_pct),
		normalPairPct:   Number(plan.normal_pair_pct),
		bestPairPct:     Number(plan.best_pair_pct),
		kioskCost:       Number(plan.kiosk_cost),
		electricityCost: Number(plan.electricity_cost),
		equipmentCost:   Number(plan.equipment_cost),
		otherCost:       Number(plan.other_cost),
		items,
	};
}

export async function saveMarketplacePlan(data: MarketplacePlanValues): Promise<{ error?: string }> {
	const db = createSupabaseAdmin();

	const { error: planErr } = await db.from("marketplace_plan").upsert({
		id:               true,
		name:             data.name,
		days:             data.days,
		worst_pair_pct:   data.worstPairPct,
		normal_pair_pct:  data.normalPairPct,
		best_pair_pct:    data.bestPairPct,
		kiosk_cost:       data.kioskCost,
		electricity_cost: data.electricityCost,
		equipment_cost:   data.equipmentCost,
		other_cost:       data.otherCost,
		updated_at:       new Date().toISOString(),
	});
	if (planErr) return { error: planErr.message };

	await db.from("marketplace_plan_items").delete().not("id", "is", null);
	const validItems = data.items.filter((i) => i.name.trim());
	if (validItems.length > 0) {
		const { error: itemsErr } = await db.from("marketplace_plan_items").insert(
			validItems.map((item, i) => ({
				name:                item.name.trim(),
				single_price:        item.singlePrice,
				pair_total:          item.pairTotal,
				cogs_per_unit:       item.cogsPerUnit,
				worst_cups_per_day:  item.worstCupsPerDay,
				normal_cups_per_day: item.normalCupsPerDay,
				best_cups_per_day:   item.bestCupsPerDay,
				sort_order:          i,
			})),
		);
		if (itemsErr) return { error: itemsErr.message };
	}

	revalidatePath("/christmas-market");
	return {};
}
