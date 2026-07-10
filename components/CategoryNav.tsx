"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Category {
	slug: string | null;
	name: string | null;
}

export default function CategoryNav({
	allLabel,
	categories,
}: Readonly<{ allLabel: string; categories: Category[] }>) {
	const pathname = usePathname();

	return (
		<nav className="mt-8 flex flex-wrap gap-2">
			<CategoryPill
				href="/products"
				label={allLabel}
				exact
				pathname={pathname}
			/>
			{categories.map((c) => (
				<CategoryPill
					key={c.slug}
					href={`/products/${c.slug}`}
					label={c.name ?? ""}
					pathname={pathname}
				/>
			))}
		</nav>
	);
}

function CategoryPill({
	href,
	label,
	exact,
	pathname,
}: Readonly<{
	href: string;
	label: string;
	exact?: boolean;
	pathname: string;
}>) {
	const isActive = exact
		? pathname === href
		: pathname === href || pathname.startsWith(`${href}/`);

	return (
		<Link
			href={href}
			className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
				isActive
					? "border-primary bg-primary text-primary-foreground"
					: "border-border bg-card text-foreground/80 hover:border-primary/60 hover:text-foreground"
			}`}
		>
			{label}
		</Link>
	);
}
