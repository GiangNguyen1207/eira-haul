'use client';
import { useState } from "react";
import { COLS, STATUS_CONFIRMED, CONFIRM } from "@/constant";
import { capitalizeFirstLetter } from "@/lib/utils";
import type { getOrders } from "@/lib/orders";
import { confirmOrder } from "@/lib/orders";

type Order = Awaited<ReturnType<typeof getOrders>>[number];

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [loading, setLoading] = useState(false);

    const handleConfirm = async (id: string) => {
      setLoading(true);
      await confirmOrder(id);
      setLoading(false);
    };

	return (
		<div className="overflow-x-auto rounded-xl border border-border">
			<table className="w-full text-sm">
				<thead className="border-b border-border bg-muted/50">
					<tr>
						{COLS.map((col) => (
							<th
								key={col}
								className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
							>
								{col}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-border">
					{orders.map((order) => (
						<tr key={order.id} className="transition hover:bg-muted/30">
							<td className="px-4 py-3 font-mono text-xs text-foreground">
								{order.reference}
							</td>
							<td className="px-4 py-3 text-foreground">
								{order.customer_name}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{order.customer_email}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{order.customer_phone}
							</td>
							<td className="px-4 py-3 text-foreground">
								€{order.total.toFixed(2)}
							</td>
							<td className="px-4 py-3">
								<span
									className={`rounded-full px-2 py-0.5 text-xs font-medium ${order.status === STATUS_CONFIRMED ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
								>
									{capitalizeFirstLetter(order.status)}
								</span>
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{new Date(order.created_at).toLocaleDateString("en-GB", {
									month: "2-digit",
									day: "2-digit",
									year: "numeric",
								})}
							</td>
							<td className="px-4 py-3">
								{order.status !== STATUS_CONFIRMED && (
									<button
                        type="button"
                        onClick={() => handleConfirm(order.id)}
                        disabled={loading}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
                      >
                        {CONFIRM}
                      </button>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
