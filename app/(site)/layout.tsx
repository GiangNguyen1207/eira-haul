import { AppBar } from "@/components/AppBar";
import { CartProvider } from "@/context/CartContext";

export default function SiteLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<CartProvider>
			<AppBar />
			{children}
		</CartProvider>
	);
}
