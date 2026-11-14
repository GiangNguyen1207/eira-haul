"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { datetimeLocalToISO } from "@/lib/utils";

export type SaleItemInput = {
	productId: string;
	qty: number;
	unitPrice: number;
	discountPct: number;
};

export type SaleInput = {
	occurredAt: string;
	platform: string;
	items: SaleItemInput[];
};

export async function recordSale(data: SaleInput): Promise<{ error?: string }> {
	if (!data.items.length) return { error: "Add at least one item." };

	const db = createSupabaseAdmin();
	const occurredAt = datetimeLocalToISO(data.occurredAt);

	// Discounts are entered as a percentage per line on the frontend; convert each
	// to a euro amount (rounded to cents) so the stored totals stay in money terms.
	const lines = data.items.map((i) => {
		const gross = i.qty * i.unitPrice;
		const discount = Math.round(gross * (i.discountPct / 100) * 100) / 100;
		return { ...i, discount };
	});

	const discountTotal = lines.reduce((s, i) => s + i.discount, 0);
	const total = lines.reduce((s, i) => s + i.qty * i.unitPrice - i.discount, 0);

	const { data: sale, error: saleErr } = await db
		.from("sales")
		.insert({
			occurred_at: occurredAt,
			total,
			discount_total: discountTotal,
			platform: data.platform || null,
		})
		.select("id")
		.single();

	if (saleErr) return { error: saleErr.message };

	const { error: itemsErr } = await db.from("sale_items").insert(
		lines.map((i) => ({
			sale_id: sale.id,
			product_id: i.productId,
			qty: i.qty,
			unit_price: i.unitPrice,
			line_discount: i.discount,
		})),
	);
	if (itemsErr) return { error: itemsErr.message };

	// Aggregate qty per product so duplicate lines don't cause stale-read overwrites
	const qtyByProduct = new Map<string, number>();
	for (const item of data.items) {
		qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) ?? 0) + item.qty);
	}

	const { data: stocks } = await db
		.from("products")
		.select("id, current_stock")
		.in("id", [...qtyByProduct.keys()]);

	const stockMap = new Map(stocks?.map((p) => [p.id, p.current_stock]) ?? []);

	for (const item of data.items) {
		await db.from("stock_moves").insert({
			product_id: item.productId,
			type: "sale",
			qty: -item.qty,
			occurred_at: occurredAt,
		});
	}

	for (const [productId, totalQty] of qtyByProduct) {
		const current = stockMap.get(productId) ?? 0;
		await db
			.from("products")
			.update({ current_stock: Math.max(0, current - totalQty) })
			.eq("id", productId);
	}

	revalidatePath("/sales");
	revalidatePath("/products");
	return {};
}
