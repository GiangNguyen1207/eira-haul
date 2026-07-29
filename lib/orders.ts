"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "./supabase";
import { createSupabaseServer } from "./supabase-server";
import type { OrderInput } from "./types";

export async function createOrder(input: OrderInput): Promise<string> {
	const { data: order, error: orderError } = await supabase
		.from("orders")
		.insert({
			customer_name: input.customer_name,
			customer_email: input.customer_email,
			customer_phone: input.customer_phone,
			reference: input.reference,
			total: input.total,
			status: "pending",
		})
		.select("id")
		.single();

	if (orderError) throw orderError;

	const { error: itemsError } = await supabase.from("order_items").insert(
		input.items.map((item) => ({
			order_id: order.id,
			product_id: item.id,
			product_name: item.name ?? `Product #${item.id}`,
			price: item.price,
			quantity: item.quantity,
		})),
	);

	if (itemsError) throw itemsError;

	return order.id;
}

export async function getOrders() {
	const client = await createSupabaseServer();
	const { data, error } = await client
		.from("orders")
		.select(
			"id, reference, customer_name, customer_email, customer_phone, total, status, created_at",
		)
		.order("created_at", { ascending: false });

	if (error) return [];
	return data;
}

export async function getOrderByReference(reference: string) {
	const { data, error } = await supabase
		.from("orders")
		.select("customer_name, reference, total, status, created_at")
		.eq("reference", reference)
		.single();

	if (error) return null;
	return data;
}

export async function confirmOrder(id: string) {
	const client = await createSupabaseServer();
	await client.from("orders").update({ status: "confirmed" }).eq("id", id);
	revalidatePath("/admin/orders");
}
