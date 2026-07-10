import type { Metadata } from "next";
import { Inter, Shippori_Mincho } from "next/font/google";
import { SanityLive } from "@/sanity/lib/live";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
});

const shipporiMincho = Shippori_Mincho({
	variable: "--font-shippori-mincho",
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Eira Haul",
	description: "Japanese doorstep delights",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${shipporiMincho.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<SanityLive />
				{children}
			</body>
		</html>
	);
}
