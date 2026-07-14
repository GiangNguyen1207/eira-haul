import { AppBar } from "@/components/AppBar";
import Footer from "@/components/SiteFooter";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/sonner";

export default function SiteLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<CartProvider>
			<Toaster />
			<AppBar />
			{children}
			<Footer />
		</CartProvider>
	);
}
