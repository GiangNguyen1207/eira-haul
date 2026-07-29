"use client";

import { FROM_JP, LOGO, LOGOUT } from "@/constant";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";

export default function AdminLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const router = useRouter();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push("/admin/login");
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
				<div className="mx-auto max-w-6xl px-6 py-4 flex justify-between">
					<div className="flex items-baseline gap-2">
						<span className="text-xl font-semibold text-primary">{LOGO}</span>
						<span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground sm:inline">
							{FROM_JP}
						</span>
					</div>
					<Button
						type="button"
						variant="ghost"
						label={LOGOUT}
						onClick={handleLogout}
						className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
					/>
				</div>
			</header>
			<main>{children}</main>
		</div>
	);
}
