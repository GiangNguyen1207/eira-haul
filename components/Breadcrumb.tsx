import Link from "next/link";

type BreadcrumbItem = {
	label: string;
	href?: string;
};

type BreadcrumbProps = {
	items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: Readonly<BreadcrumbProps>) {
	return (
		<nav className="text-xs text-muted-foreground">
			{items.map((item, i) => (
				<span key={item.label}>
					{i > 0 && <span className="mx-2">/</span>}
					{item.href ? (
						<Link href={item.href} className="transition hover:text-primary">
							{item.label}
						</Link>
					) : (
						<span className="text-foreground">{item.label}</span>
					)}
				</span>
			))}
		</nav>
	);
}
