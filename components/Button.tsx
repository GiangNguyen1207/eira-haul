interface ButtonProps {
	label: string;
	variant: "primary" | "secondary" | "tertiary";
	onClick?: () => void;
	children: React.ReactNode;
	className?: string;
}

export default function Button({
	label,
	variant,
	onClick,
	children,
	className,
}: ButtonProps) {
	const baseClasses =
		"px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-opacity-75";
	let variantClasses = "";
	switch (variant) {
		case "primary":
			variantClasses =
				"text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-400";
			break;
		case "secondary":
			variantClasses =
				"text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-400";
			break;
		case "tertiary":
			variantClasses =
				"text-blue-500 bg-transparent hover:bg-blue-100 focus:ring-blue-400";
			break;
	}

	return (
		<button
			type="button"
			className={`${baseClasses} ${variantClasses} ${className ?? ""}`}
			onClick={onClick}
		>
			{label}
			{children}
		</button>
	);
}
