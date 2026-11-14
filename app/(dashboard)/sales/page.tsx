import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { formatDateTime, formatMonth, formatPrice, toDatetimeLocal } from "@/lib/utils";

export default async function SalesPage() {
	const db = createSupabaseAdmin();
	const { data: sales } = await db
		.from("sales")
		.select("*, sale_items(count)")
		.order("occurred_at", { ascending: false });

	// Group sales by month (Helsinki). Sales arrive newest-first, so insertion
	// order gives newest month first, with newest sales first inside each month.
	type SaleRow = NonNullable<typeof sales>[number];
	const monthGroups = new Map<string, SaleRow[]>();
	for (const s of sales ?? []) {
		const key = toDatetimeLocal(new Date(s.occurred_at)).slice(0, 7);
		const arr = monthGroups.get(key) ?? [];
		arr.push(s);
		monthGroups.set(key, arr);
	}

	return (
		<section className="space-y-5">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-2xl font-semibold text-foreground">Sales</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Every sale you&apos;ve recorded.
					</p>
				</div>
				<Link
					href="/sales/new"
					className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
				>
					Record sale
				</Link>
			</div>

			{!sales?.length ? (
				<div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
					No sales yet.{" "}
					<Link href="/sales/new" className="text-primary hover:underline">
						Record your first sale.
					</Link>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-card">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
								<th className="px-5 py-3 font-medium">Date</th>
								<th className="px-5 py-3 text-right font-medium">Items</th>
								<th className="px-5 py-3 font-medium">Platform</th>
								<th className="px-5 py-3 text-right font-medium">Discount</th>
								<th className="px-5 py-3 text-right font-medium">Total</th>
							</tr>
						</thead>
						{[...monthGroups.entries()].map(([monthKey, rows]) => {
							const monthRevenue = rows.reduce((sum, s) => sum + Number(s.total), 0);
							return (
								<tbody key={monthKey}>
									<tr className="border-b border-border bg-secondary/40">
										<td colSpan={5} className="px-5 py-2.5">
											<div className="flex items-center justify-between gap-3">
												<span className="font-semibold text-foreground">{formatMonth(monthKey)}</span>
												<span className="text-xs tabular-nums text-muted-foreground">
													{rows.length} {rows.length === 1 ? "sale" : "sales"} · {formatPrice(monthRevenue)}
												</span>
											</div>
										</td>
									</tr>
									{rows.map((s) => {
										const itemCount = (s.sale_items as unknown as { count: number }[])?.[0]?.count ?? 0;
										return (
											<tr key={s.id} className="relative cursor-pointer border-b border-border/50 hover:bg-secondary/30">
												<td className="px-5 py-3 whitespace-nowrap">
													<Link
														href={`/sales/${s.id}`}
														className="font-medium text-foreground after:absolute after:inset-0 after:content-['']"
													>
														{formatDateTime(s.occurred_at)}
													</Link>
												</td>
												<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
													{itemCount}
												</td>
												<td className="px-5 py-3 text-muted-foreground">
													{s.platform ?? "—"}
												</td>
												<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
													{Number(s.discount_total) > 0 ? formatPrice(Number(s.discount_total)) : "—"}
												</td>
												<td className="px-5 py-3 text-right tabular-nums font-medium text-foreground">
													{formatPrice(Number(s.total))}
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
