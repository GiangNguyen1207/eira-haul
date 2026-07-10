type Props = {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	className?: string;
};

export default function QuantityStepper({
	value,
	onChange,
	min = 1,
	className,
}: Readonly<Props>) {
	return (
		<div className={`flex items-center rounded-md border border-border ${className ?? "h-9"}`}>
			<button
				type="button"
				onClick={() => onChange(Math.max(min, value - 1))}
				className="flex h-full items-center px-2 text-muted-foreground transition hover:text-foreground cursor-pointer"
			>
				−
			</button>
			<span className="min-w-6 text-center text-sm text-foreground">{value}</span>
			<button
				type="button"
				onClick={() => onChange(value + 1)}
				className="flex h-full items-center px-2 text-muted-foreground transition hover:text-foreground cursor-pointer"
			>
				+
			</button>
		</div>
	);
}
