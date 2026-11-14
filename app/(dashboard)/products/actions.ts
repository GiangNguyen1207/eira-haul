"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type ProductFormValues = {
	name: string;
	categoryName: string;
	sku: string;
	unit: "piece" | "pack" | "box" | "set";
	costPrice: number;
	sellPrice: number;
	currentStock: number;
	reorderThreshold: number;
	active: boolean;
};

async function resolveCategory(db: ReturnType<typeof createSupabaseAdmin>, name: string): Promise<string | null> {
	if (!name.trim()) return null;

	const { data: existing } = await db
		.from("categories")
		.select("id")
		.ilike("name", name.trim())
		.maybeSingle();

	if (existing) return existing.id;

	const { data: created } = await db
		.from("categories")
		.insert({ name: name.trim() })
		.select("id")
		.single();

	return created?.id ?? null;
}

export async function saveProduct(
	id: string | null,
	data: ProductFormValues,
): Promise<{ error?: string; id?: string }> {
	const db = createSupabaseAdmin();
	const categoryId = await resolveCategory(db, data.categoryName);

	const payload = {
		name: data.name,
		category_id: categoryId,
		sku: data.sku.trim() || null,
		unit: data.unit,
		cost_price: data.costPrice,
		sell_price: data.sellPrice,
		current_stock: data.currentStock,
		reorder_threshold: data.reorderThreshold,
		active: data.active,
	};

	if (id) {
		const { error } = await db.from("products").update(payload).eq("id", id);
		if (error) return { error: error.message };
		revalidatePath("/products");
		return { id };
	}

	const { data: created, error } = await db
		.from("products")
		.insert(payload)
		.select("id")
		.single();

	if (error) return { error: error.message };
	revalidatePath("/products");
	return { id: created.id };
}

export async function toggleProductActive(id: string, active: boolean): Promise<{ error?: string }> {
	const db = createSupabaseAdmin();
	const { error } = await db.from("products").update({ active }).eq("id", id);
	if (error) return { error: error.message };
	revalidatePath("/products");
	return {};
}
