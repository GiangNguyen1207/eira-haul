import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/utils";
import { twMerge } from "tailwind-merge";
import ToggleActive from "./ToggleActive";

export default async function ProductsPage() {
	const db = createSupabaseAdmin();
	const { data: products } = await db
		.from("products")
		.select("*, categories(name)")
		.order("name");

	// Group products by category name (products arrive sorted by name, so each
	// group keeps that order). Uncategorized items are collected under their own
	// group and pushed to the end.
	type ProductRow = NonNullable<typeof products>[number];
	const groups = new Map<string, ProductRow[]>();
	for (const p of products ?? []) {
		const cat = (p.categories as { name: string } | null)?.name ?? "Uncategorized";
		const arr = groups.get(cat) ?? [];
		arr.push(p);
		groups.set(cat, arr);
	}
	const sortedGroups = [...groups.entries()].sort(([a], [b]) => {
		if (a === "Uncategorized") return 1;
		if (b === "Uncategorized") return -1;
		return a.localeCompare(b);
	});

	return (
		<section className="space-y-5">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-2xl font-semibold text-foreground">Products</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Your product catalog - cost, sell price, and stock levels.
					</p>
				</div>
				<Link
					href="/products/new"
					className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
				>
					Add product
				</Link>
			</div>

			{!products?.length ? (
				<div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
					No products yet.{" "}
					<Link href="/products/new" className="text-primary hover:underline">
						Add your first product.
					</Link>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-card">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
								<th className="px-5 py-3 font-medium">Name</th>
								<th className="px-5 py-3 text-right font-medium">Cost</th>
								<th className="px-5 py-3 text-right font-medium">Sell</th>
								<th className="px-5 py-3 text-right font-medium">Margin</th>
								<th className="px-5 py-3 text-right font-medium">Stock</th>
								<th className="px-5 py-3 font-medium">Status</th>
								<th className="px-5 py-3" />
							</tr>
						</thead>
						{sortedGroups.map(([category, rows]) => {
							const totalStock = rows.reduce((sum, p) => sum + p.current_stock, 0);

							return (
								<tbody key={category}>
									<tr className="border-b border-border bg-secondary/40">
										<td colSpan={7} className="px-5 py-2.5">
											<div className="flex items-center justify-between gap-3">
												<span className="font-semibold text-foreground">{category}</span>
												<span className="text-xs tabular-nums text-muted-foreground">
													{rows.length} {rows.length === 1 ? "product" : "products"} · {totalStock} in stock
												</span>
											</div>
										</td>
									</tr>
									{rows.map((p) => {
										const margin = p.sell_price > 0
											? ((p.sell_price - p.cost_price) / p.sell_price) * 100
											: 0;
										const lowStock = p.current_stock <= p.reorder_threshold && p.reorder_threshold > 0;

										return (
											<tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
												<td className="px-5 py-3 font-medium text-foreground">
													<Link href={`/products/${p.id}`} className="hover:text-primary">
														{p.name}
													</Link>
												</td>
												<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
													{formatPrice(p.cost_price)}
												</td>
												<td className="px-5 py-3 text-right tabular-nums text-foreground">
													{formatPrice(p.sell_price)}
												</td>
												<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
													{margin.toFixed(1)}%
												</td>
												<td className={twMerge(
													"px-5 py-3 text-right tabular-nums",
													lowStock ? "font-semibold text-amber-600" : "text-foreground",
												)}>
													{p.current_stock}
													{lowStock && " ⚠"}
												</td>
												<td className="px-5 py-3">
													<span className={twMerge(
														"rounded-full px-2 py-0.5 text-xs font-medium",
														p.active
															? "bg-green-100 text-green-700"
															: "bg-secondary text-muted-foreground",
													)}>
														{p.active ? "Active" : "Inactive"}
													</span>
												</td>
												<td className="px-5 py-3">
													<ToggleActive id={p.id} active={p.active} />
												</td>
											</tr>
										);
									})}
								</tbody>
							);
						})}
					</table>
				</div>
			)}
		</section>
	);
}
