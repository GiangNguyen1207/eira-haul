interface IconButtonProps {
	icon: React.ReactNode;
	onClick: () => void;
	className?: string;
	variant?: "primary" | "secondary";
}

export default function IconButton({
	icon,
	onClick,
	className,
	variant = "primary",
}: IconButtonProps) {
	return (
		<button
			type="button"
			className={`size-9 flex items-center justify-center rounded-md border border-border focus:outline-none transition cursor-pointer ${
				variant === "primary"
					? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
					: "bg-foreground hover:bg-foreground/90 text-primary/90"
			} ${className ?? ""}`}
			onClick={onClick}
		>
			{icon}
		</button>
	);
}
