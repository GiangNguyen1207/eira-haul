"use client";

import {
	LineChart,
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

// One row per month, one column per scenario, e.g. { label, base, best, worst }.
export type ScenarioCashPoint = Record<string, number | string> & {
	label: string;
};

const SERIES = [
	{ key: "base", name: "Base case", color: "var(--primary)" },
	{ key: "best", name: "Best case", color: "#0d9488" },
	{ key: "worst", name: "Worst case", color: "#dc2626" },
];

export default function ScenarioCashChart({ data }: { data: ScenarioCashPoint[] }) {
	return (
		<div className="h-80 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
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
					<ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
					{SERIES.map((s) => (
						<Line
							key={s.key}
							type="monotone"
							dataKey={s.key}
							name={s.name}
							stroke={s.color}
							strokeWidth={2.5}
							dot={false}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
