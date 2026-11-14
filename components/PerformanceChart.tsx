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

export type PerformancePoint = {
	label: string;
	actualRevenue: number | null;
	forecastRevenue: number | null;
	netProfit: number;
};

// Monthly revenue as bars (recorded = solid, forecast run-rate = muted) with the
// net profit/loss line on top, so profitability reads against turnover.
export default function PerformanceChart({ data }: { data: PerformancePoint[] }) {
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
						formatter={(value: number, name) => [value == null ? "—" : formatCurrency(value), name]}
						contentStyle={{
							borderRadius: 12,
							border: "1px solid var(--border)",
							background: "var(--card)",
							fontSize: 13,
						}}
					/>
					<Legend wrapperStyle={{ fontSize: 13 }} />
					<ReferenceLine y={0} stroke="var(--muted-foreground)" />
					<Bar dataKey="actualRevenue" name="Revenue (actual)" stackId="rev" fill="var(--primary)" radius={[3, 3, 0, 0]} />
					<Bar dataKey="forecastRevenue" name="Revenue (forecast)" stackId="rev" fill="var(--border)" radius={[3, 3, 0, 0]} />
					<Line
						type="monotone"
						dataKey="netProfit"
						name="Net profit / loss"
						stroke="#0d9488"
						strokeWidth={2.5}
						dot={{ r: 3 }}
					/>
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
}
