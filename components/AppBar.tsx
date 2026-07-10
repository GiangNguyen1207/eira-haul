"use client";
import { FROM_JP, MENU } from "@/constant";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Badge from "@/components/Badge";
import { useCart } from "@/context/CartContext";

export function AppBar() {
	const pathname = usePathname();
	const isActive = (href: string) => pathname === href;
	const isCartMenu = (label: string) => label === "Cart";
	const { count } = useCart();

	return (
		<header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				<Link href="/" className="flex items-baseline gap-2">
					<span className="text-xl font-semibold text-primary">Eira Haul</span>
					<span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground sm:inline">
						{FROM_JP}
					</span>
				</Link>
				<nav className="flex items-center gap-6 text-sm font-semibold">
					{MENU.map(({ href, label }) => (
						<Link
							href={href}
							key={href}
							className={`transition-colors ${isActive(href) ? "text-primary" : "text-foreground/70 hover:text-foreground"} ${isCartMenu(label) ? "flex items-center gap-1.5" : ""}`}
						>
							<span>{label}</span>
							{isCartMenu(label) && <Badge count={count} />}
						</Link>
					))}
				</nav>
			</div>
		</header>
	);
}
