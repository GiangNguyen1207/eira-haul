import { HEALTH_LABEL } from "@/constant";
import type { HealthStatus } from "@/lib/forecast";
import { twMerge } from "tailwind-merge";

const STYLES: Record<HealthStatus, string> = {
	healthy: "bg-emerald-100 text-emerald-800 border-emerald-200",
	normal: "bg-amber-100 text-amber-800 border-amber-200",
	unhealthy: "bg-red-100 text-red-800 border-red-200",
};

const DOT: Record<HealthStatus, string> = {
	healthy: "bg-emerald-500",
	normal: "bg-amber-500",
	unhealthy: "bg-red-500",
};

export default function HealthPill({
	status,
	className,
}: {
	status: HealthStatus;
	className?: string;
}) {
	return (
		<span
			className={twMerge(
				"inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
				STYLES[status],
				className,
			)}
		>
			<span className={twMerge("h-2 w-2 rounded-full", DOT[status])} />
			{HEALTH_LABEL[status]}
		</span>
	);
}
