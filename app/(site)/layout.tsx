import { AppBar } from "@/components/AppBar";
import Footer from "@/components/SiteFooter";
import { CartProvider } from "@/context/CartContext";

export default function SiteLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<CartProvider>
			<AppBar />
			{children}
			<Footer />
		</CartProvider>
	);
}
