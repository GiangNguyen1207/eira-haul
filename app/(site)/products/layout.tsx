import { Metadata } from "next";
import { getCategories } from "@/sanity/lib/fetchers";
import { ALL, PRODUCTS, PRODUCTS_DESCRIPTION, PRODUCTS_JP } from "@/constant";
import CategoryNav from "@/components/CategoryNav";

export const metadata: Metadata = {
	title: "Products — Eira Haul",
	description:
		"Japanese skincare, snacks, supplements and matcha shipped from Japan to Finland.",
	openGraph: {
		title: "Products — Eira Haul",
		description:
			"Japanese skincare, snacks, supplements and matcha shipped from Japan to Finland.",
	},
};

export default async function ProductPageLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const categories = await getCategories();

	return (
		<div>
			<section className="border-b border-border/60 bg-secondary/30">
				<div className="mx-auto max-w-6xl px-6 py-14">
					<p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
						{PRODUCTS_JP}
					</p>
					<h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">
						{PRODUCTS}
					</h1>
					<p className="mt-4 max-w-2xl text-muted-foreground font-medium">
						{PRODUCTS_DESCRIPTION}
					</p>
					<CategoryNav
						allLabel={ALL}
						categories={categories.map((c) => ({
							slug: c.slug,
							name: c.name,
						}))}
					/>
				</div>
			</section>
			{children}
		</div>
	);
}
