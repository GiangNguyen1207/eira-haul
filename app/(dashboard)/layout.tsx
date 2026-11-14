import TopBar from "@/components/TopBar";
import { Toaster } from "@/components/sonner";

export default function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Toaster />
			<TopBar />
			<main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
				{children}
			</main>
		</div>
	);
}
