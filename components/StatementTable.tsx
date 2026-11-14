import type { MonthLine } from "@/lib/forecast";
import { formatCurrency, formatSigned, formatPct } from "@/lib/utils";
import { twMerge } from "tailwind-merge";

export type StatementRow = {
	label: string;
	get: (l: MonthLine) => number;
	kind?: "currency" | "signed" | "pct"; // default: currency
	total?: "sum" | "avg" | "none"; // default: sum (none for pct)
	strong?: boolean; // bold emphasis (e.g. Net Profit, Closing Cash)
	divider?: boolean; // top border to separate groups
};

function fmt(value: number, kind: StatementRow["kind"]): string {
	if (kind === "pct") return formatPct(value);
	if (kind === "signed") return formatSigned(value);
	return formatCurrency(value);
}

function rowTotal(row: StatementRow, months: MonthLine[]): number | null {
	const mode = row.total ?? (row.kind === "pct" ? "none" : "sum");
	if (mode === "none" || months.length === 0) return null;
	const sum = months.reduce((s, l) => s + row.get(l), 0);
	return mode === "avg" ? sum / months.length : sum;
}

// Excel-style statement: line items as rows, months as columns, Total on the right.
export default function StatementTable({
	months,
	rows,
}: {
	months: MonthLine[];
	rows: StatementRow[];
}) {
	return (
		<div className="overflow-x-auto rounded-xl border border-border bg-card">
			<table className="w-full min-w-[720px] border-collapse text-sm">
				<thead>
					<tr className="border-b border-border bg-secondary/50">
						<th className="sticky left-0 z-10 bg-secondary/50 px-4 py-2 text-left font-medium text-muted-foreground">
							Line item
						</th>
						{months.map((m) => (
							<th
								key={m.month}
								className="px-3 py-2 text-right font-medium text-muted-foreground whitespace-nowrap"
							>
								{m.label}
							</th>
						))}
						<th className="px-4 py-2 text-right font-semibold text-foreground">
							Total
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => {
						const total = rowTotal(row, months);
						return (
							<tr
								key={row.label}
								className={twMerge(
									"border-b border-border/50 last:border-0",
									row.divider && "border-t-2 border-t-border",
									row.strong && "font-semibold",
								)}
							>
								<td
									className={twMerge(
										"sticky left-0 z-10 bg-card px-4 py-2 text-left whitespace-nowrap",
										row.strong ? "text-foreground" : "text-muted-foreground",
									)}
								>
									{row.label}
								</td>
								{months.map((m) => {
									const v = row.get(m);
									return (
										<td
											key={m.month}
											className={twMerge(
												"px-3 py-2 text-right tabular-nums whitespace-nowrap",
												v < 0 && row.kind !== "pct" && "text-red-600",
											)}
										>
											{fmt(v, row.kind)}
										</td>
									);
								})}
								<td className="px-4 py-2 text-right font-semibold tabular-nums text-foreground whitespace-nowrap">
									{total === null ? "—" : fmt(total, row.kind)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
