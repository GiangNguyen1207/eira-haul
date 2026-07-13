interface ButtonProps {
	label: string;
	variant: "primary" | "secondary" | "ghost";
	onClick?: () => void;
	children?: React.ReactNode;
	className?: string;
	type?: "button" | "submit" | "reset";
	disabled?: boolean;
}

export default function Button({
	label,
	variant,
	onClick,
	children,
	className,
	type = "button",
	disabled,
}: ButtonProps) {
	const baseClasses =
		"px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-opacity-75 cursor-pointer";
	let variantClasses = "";
	switch (variant) {
		case "primary":
			variantClasses =
				"text-white bg-primary hover:bg-primary/90 focus:ring-primary";
			break;
		case "secondary":
			variantClasses =
				"text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-400";
			break;
		case "ghost":
			variantClasses = "bg-transparent hover:text-primary focus:text-primary";
			break;
	}

	return (
		<button
			type={type}
			disabled={disabled}
			className={`${baseClasses} ${variantClasses} ${className ?? ""}`}
			onClick={onClick}
		>
			{label}
			{children}
		</button>
	);
}
