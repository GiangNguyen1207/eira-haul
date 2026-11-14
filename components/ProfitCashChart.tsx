"use client";

import {
	ComposedChart,
	Bar,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export type ProfitCashPoint = {
	label: string;
	netProfit: number;
	closingCash: number;
};

// Visualises the owner's core concern: profit (bars) vs. cash (line) can diverge.
export default function ProfitCashChart({ data }: { data: ProfitCashPoint[] }) {
	return (
		<div className="h-80 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
					<YAxis
						tick={{ fontSize: 12 }}
						stroke="var(--muted-foreground)"
						tickFormatter={(v) => formatCurrency(v)}
						width={70}
					/>
					<Tooltip
						formatter={(value: number, name) => [formatCurrency(value), name]}
						contentStyle={{
							borderRadius: 12,
							border: "1px solid var(--border)",
							background: "var(--card)",
							fontSize: 13,
						}}
					/>
					<Legend wrapperStyle={{ fontSize: 13 }} />
					<ReferenceLine y={0} stroke="var(--muted-foreground)" />
					<Bar dataKey="netProfit" name="Net profit" fill="var(--primary)" radius={[3, 3, 0, 0]} />
					<Line
						type="monotone"
						dataKey="closingCash"
						name="Closing cash"
						stroke="#0d9488"
						strokeWidth={2.5}
						dot={false}
					/>
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
}
