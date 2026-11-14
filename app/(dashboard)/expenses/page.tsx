import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice, formatMonth } from "@/lib/utils";

const DATE_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(dateStr: string): string {
	const [y, m, d] = dateStr.split("-").map(Number);
	return `${d} ${DATE_MONTHS[m - 1]} ${y}`;
}

export default async function ExpensesPage() {
	const db = createSupabaseAdmin();
	const { data: expenses } = await db
		.from("expenses")
		.select("id, name, supplier, occurred_at, amount, has_vat, vat_amount, amount_after_vat, sent_to_accountant")
		.order("occurred_at", { ascending: false });

	type ExpenseRow = NonNullable<typeof expenses>[number];
	const monthGroups = new Map<string, ExpenseRow[]>();
	for (const e of expenses ?? []) {
		const key = (e.occurred_at as string).slice(0, 7);
		const arr = monthGroups.get(key) ?? [];
		arr.push(e);
		monthGroups.set(key, arr);
	}

	return (
		<section className="space-y-5">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-2xl font-semibold text-foreground">Expenses</h1>
					<p className="mt-1 text-sm text-muted-foreground">Every expense you&apos;ve recorded.</p>
				</div>
				<Link
					href="/expenses/new"
					className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
				>
					Record expense
				</Link>
			</div>

			{!expenses?.length ? (
				<div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
					No expenses yet.{" "}
					<Link href="/expenses/new" className="text-primary hover:underline">
						Record your first expense.
					</Link>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-card">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
								<th className="px-5 py-3 font-medium">Date</th>
								<th className="px-5 py-3 font-medium">Name</th>
								<th className="px-5 py-3 font-medium">Supplier</th>
								<th className="px-5 py-3 text-right font-medium">Amount</th>
								<th className="px-5 py-3 text-right font-medium">VAT</th>
								<th className="px-5 py-3 text-right font-medium">Total</th>
								<th className="px-5 py-3 text-center font-medium">Accountant</th>
							</tr>
						</thead>
						{[...monthGroups.entries()].map(([monthKey, rows]) => {
							const monthTotal = rows.reduce((sum, e) => sum + Number(e.amount_after_vat), 0);
							return (
								<tbody key={monthKey}>
									<tr className="border-b border-border bg-secondary/40">
										<td colSpan={7} className="px-5 py-2.5">
											<div className="flex items-center justify-between gap-3">
												<span className="font-semibold text-foreground">{formatMonth(monthKey)}</span>
												<span className="text-xs tabular-nums text-muted-foreground">
													{rows.length} {rows.length === 1 ? "expense" : "expenses"} · {formatPrice(monthTotal)}
												</span>
											</div>
										</td>
									</tr>
									{rows.map((e) => (
										<tr key={e.id} className="border-b border-border/50 last:border-0">
											<td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
												{formatDate(e.occurred_at as string)}
											</td>
											<td className="px-5 py-3 font-medium text-foreground">{e.name ?? "—"}</td>
											<td className="px-5 py-3 text-muted-foreground">{e.supplier ?? "—"}</td>
											<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
												{formatPrice(Number(e.amount))}
											</td>
											<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
												{e.has_vat ? formatPrice(Number(e.vat_amount)) : "—"}
											</td>
											<td className="px-5 py-3 text-right tabular-nums font-medium text-foreground">
												{formatPrice(Number(e.amount_after_vat))}
											</td>
											<td className="px-5 py-3 text-center">
												{e.sent_to_accountant ? (
													<CheckCircleIcon className="mx-auto h-4 w-4 text-green-500" />
												) : (
													<span className="text-muted-foreground">—</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							);
						})}
					</table>
				</div>
			)}
		</section>
	);
}
