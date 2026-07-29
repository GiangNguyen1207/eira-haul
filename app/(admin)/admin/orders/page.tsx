import { getOrders } from "@/lib/orders";
import { ORDERS, NO_ORDERS } from "@/constant";
import OrdersTable from "../../../../components/OrdersTable";

export default async function AdminOrdersPage() {
	const orders = await getOrders();

	return (
		<div className="mx-auto max-w-6xl px-6 py-10">
			<h1 className="mb-6 font-serif text-2xl font-semibold text-foreground">
				{ORDERS}
			</h1>
			{orders.length === 0 && (
				<p className="text-sm text-muted-foreground">{NO_ORDERS}</p>
			)}
			{orders.length > 0 && <OrdersTable orders={orders} />}
		</div>
	);
}
