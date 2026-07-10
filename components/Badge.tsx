interface BadgeProps {
	count: number;
}

export default function Badge({ count }: BadgeProps) {
	return (
		<span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
			{count}
		</span>
	);
}
