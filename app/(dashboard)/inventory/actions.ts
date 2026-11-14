"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { datetimeLocalToISO } from "@/lib/utils";

export type ReceiveItemInput = {
	productId: string;
	qty: number;
	unitCost: number;
};

export type ReceiveInput = {
	occurredAt: string;
	note: string;
	items: ReceiveItemInput[];
};

export async function receiveStock(data: ReceiveInput): Promise<{ error?: string }> {
	if (!data.items.length) return { error: "Add at least one item." };

	const db = createSupabaseAdmin();
	const occurredAt = datetimeLocalToISO(data.occurredAt);

	const { data: stocks } = await db
		.from("products")
		.select("id, current_stock")
		.in("id", data.items.map((i) => i.productId));

	const stockMap = new Map(stocks?.map((p) => [p.id, p.current_stock]) ?? []);

	await Promise.all(
		data.items.map(async (item) => {
			await db.from("stock_moves").insert({
				product_id: item.productId,
				type: "purchase",
				qty: item.qty,
				unit_cost: item.unitCost || null,
				note: data.note || null,
				occurred_at: occurredAt,
			});
			await db
				.from("products")
				.update({ current_stock: (stockMap.get(item.productId) ?? 0) + item.qty })
				.eq("id", item.productId);
		}),
	);

	revalidatePath("/inventory");
	revalidatePath("/products");
	return {};
}

export type AdjustInput = {
	productId: string;
	type: "adjustment" | "wastage";
	qty: number;
	note: string;
	occurredAt: string;
};

export async function adjustStock(data: AdjustInput): Promise<{ error?: string }> {
	const db = createSupabaseAdmin();
	const occurredAt = datetimeLocalToISO(data.occurredAt);

	const { data: product } = await db
		.from("products")
		.select("current_stock")
		.eq("id", data.productId)
		.single();

	if (!product) return { error: "Product not found." };

	const newStock = Math.max(0, product.current_stock + data.qty);

	await db.from("stock_moves").insert({
		product_id: data.productId,
		type: data.type,
		qty: data.qty,
		note: data.note || null,
		occurred_at: occurredAt,
	});

	await db
		.from("products")
		.update({ current_stock: newStock })
		.eq("id", data.productId);

	revalidatePath("/inventory");
	revalidatePath("/products");
	return {};
}
