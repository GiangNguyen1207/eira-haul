"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import { LOGO, APP_NAME, NAV, LOGOUT, type NavGroup, type NavItem } from "@/constant";

function isGroup(item: NavItem): item is NavGroup {
	return "children" in item;
}

function isActive(item: NavItem, pathname: string): boolean {
	if (isGroup(item)) return item.children.some((c) => pathname.startsWith(c.href));
	return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

function NavDropdown({ item, pathname }: { item: NavGroup; pathname: string }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const active = isActive(item, pathname);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				className={twMerge(
					"flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground",
					active && "bg-secondary text-foreground",
				)}
			>
				{item.label}
				<ChevronDownIcon className={twMerge("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
			</button>

			{open && (
				<div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-card shadow-md">
					{item.children.map((child) => {
						const childActive = pathname.startsWith(child.href);
						return (
							<Link
								key={child.href}
								href={child.href}
								onClick={() => setOpen(false)}
								className={twMerge(
									"block px-4 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground first:rounded-t-lg last:rounded-b-lg",
									childActive && "bg-secondary text-foreground",
								)}
							>
								{child.label}
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default function TopBar() {
	const router = useRouter();
	const pathname = usePathname();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.replace("/login");
		router.refresh();
	};

	return (
		<header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
				<div className="flex items-baseline gap-2">
					<span className="text-lg font-semibold text-primary">{LOGO}</span>
					<span className="hidden text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
						{APP_NAME}
					</span>
				</div>

				<nav className="hidden items-center gap-1 md:flex">
					{NAV.map((item) => {
						if (isGroup(item)) {
							return <NavDropdown key={item.label} item={item} pathname={pathname} />;
						}
						const active = isActive(item, pathname);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={twMerge(
									"rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground",
									active && "bg-secondary text-foreground",
								)}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>

				<Button
					type="button"
					variant="ghost"
					label={LOGOUT}
					onClick={handleLogout}
					className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
				/>
			</div>
		</header>
	);
}
