import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { formatDateTime, formatPrice } from "@/lib/utils";

type ItemRow = {
	id: string;
	qty: number;
	unit_price: number | string;
	line_discount: number | string;
	product_id: string | null;
	products: { id: string; name: string; sku: string | null; unit: string } | null;
};

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const db = createSupabaseAdmin();

	const { data: sale } = await db
		.from("sales")
		.select(
			"*, sale_items(id, qty, unit_price, line_discount, product_id, products(id, name, sku, unit))",
		)
		.eq("id", id)
		.maybeSingle();

	if (!sale) notFound();

	const items = (sale.sale_items as unknown as ItemRow[]) ?? [];
	const subtotal = items.reduce((s, i) => s + i.qty * Number(i.unit_price), 0);
	const discount = Number(sale.discount_total);
	const total = Number(sale.total);
	const unitsTotal = items.reduce((s, i) => s + i.qty, 0);

	return (
		<section className="space-y-6">
			<div>
				<p className="text-sm text-muted-foreground">
					<Link href="/sales" className="hover:text-foreground">Sales</Link>
					{" / Detail"}
				</p>
				<h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">
					{formatDateTime(sale.occurred_at)}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{sale.platform ?? "—"} · {items.length} {items.length === 1 ? "line" : "lines"} · {unitsTotal} units
				</p>
			</div>

			<div className="overflow-x-auto rounded-xl border border-border bg-card">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
							<th className="px-5 py-3 font-medium">Product</th>
							<th className="px-5 py-3 text-right font-medium">Qty</th>
							<th className="px-5 py-3 text-right font-medium">Unit price</th>
							<th className="px-5 py-3 text-right font-medium">Discount</th>
							<th className="px-5 py-3 text-right font-medium">Line total</th>
						</tr>
					</thead>
					<tbody>
						{items.map((i) => {
							const lineTotal = i.qty * Number(i.unit_price) - Number(i.line_discount);
							const product = i.products;
							return (
								<tr key={i.id} className="border-b border-border/50 last:border-0">
									<td className="px-5 py-3 font-medium text-foreground">
										{product ? (
											<Link href={`/products/${product.id}`} className="hover:text-primary">
												{product.name}
											</Link>
										) : (
											<span className="text-muted-foreground">Deleted product</span>
										)}
										{product?.sku && <span className="ml-2 text-xs text-muted-foreground">{product.sku}</span>}
									</td>
									<td className="px-5 py-3 text-right tabular-nums text-foreground">{i.qty}</td>
									<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
										{formatPrice(Number(i.unit_price))}
									</td>
									<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
										{Number(i.line_discount) > 0 ? formatPrice(Number(i.line_discount)) : "—"}
									</td>
									<td className="px-5 py-3 text-right tabular-nums font-medium text-foreground">
										{formatPrice(lineTotal)}
									</td>
								</tr>
							);
						})}
						{!items.length && (
							<tr>
								<td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
									No items on this sale.
								</td>
							</tr>
						)}
					</tbody>
					<tfoot>
						<tr className="border-t border-border">
							<td colSpan={4} className="px-5 py-2 text-right text-muted-foreground">Subtotal</td>
							<td className="px-5 py-2 text-right tabular-nums text-foreground">{formatPrice(subtotal)}</td>
						</tr>
						<tr>
							<td colSpan={4} className="px-5 py-2 text-right text-muted-foreground">Discount</td>
							<td className="px-5 py-2 text-right tabular-nums text-muted-foreground">
								{discount > 0 ? `−${formatPrice(discount)}` : formatPrice(0)}
							</td>
						</tr>
						<tr className="border-t border-border">
							<td colSpan={4} className="px-5 py-3 text-right font-semibold text-foreground">Total</td>
							<td className="px-5 py-3 text-right tabular-nums font-semibold text-foreground">{formatPrice(total)}</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</section>
	);
}
