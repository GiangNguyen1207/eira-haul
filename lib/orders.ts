import { supabase } from "./supabase";
import type { CartItem } from "./types";
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
