import Image from "next/image";
import { PRODUCT_NOT_FOUND } from "@/constant";
import { capitalizeFirstLetter } from "@/lib/utils";
import { getProductBySlug } from "@/sanity/lib/fetchers";
import Breadcrumb from "@/components/Breadcrumb";
import ProductDetailSection from "./ProductDetailSection";

export default async function ProductDetailPage({
	params,
	children,
}: {
	params: Promise<{ categorySlug: string; productSlug: string }>;
	children: React.ReactNode;
}) {
	const { productSlug } = await params;
	const product = await getProductBySlug(productSlug);

	if (!product)
		return <p className="text-muted-foreground">{PRODUCT_NOT_FOUND}</p>;

	return (
		<div className="mx-auto max-w-6xl space-y-14 px-6 py-14">
			<Breadcrumb
				items={[
					{ label: "Products", href: "/products" },
					{
						label: capitalizeFirstLetter(product.category),
						href: `/products/${product.category}`,
					},
					{ label: product.name },
				]}
			/>
			<ProductDetailSection product={product} />

			{/* {related.length > 0 && category && (
				<section>
					<h2 className="font-serif text-2xl text-foreground">
						More from {category.name}
					</h2>
					<div className="mt-6 grid gap-6 sm:grid-cols-3">
						{related.slice(0, 3).map((p) => (
							<RelatedCard key={p.id} product={p} categorySlug={categorySlug} />
						))}
					</div>
				</section>
			)} */}
		</div>
	);
}

// function RelatedCard({
// 	product,
// 	categorySlug,
// }: {
// 	product: Product;
// 	categorySlug: string;
// }) {
// 	const href = `/products/${categorySlug}/${product.productSlug}`;

// 	return (
// 		<Link
// 			href={href}
// 			className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50"
// 		>
// 			<div className="relative aspect-4/3 w-full overflow-hidden bg-secondary">
// 				{product.image ? (
// 					<Image
// 						src={urlFor(product.image).width(400).height(300).url()}
// 						alt={product.name ?? ""}
// 						fill
// 						className="object-cover transition group-hover:scale-105"
// 					/>
// 				) : (
// 					<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 via-accent/30 to-background">
// 						<span className="font-serif text-5xl text-foreground/25">和</span>
// 					</div>
// 				)}
// 			</div>
// 			<div className="p-4">
// 				<h3 className="font-serif text-base text-foreground">{product.name}</h3>
// 				{product.price != null && (
// 					<p className="mt-3 font-serif text-sm text-foreground">
// 						€{product.price.toFixed(2)}
// 					</p>
// 				)}
// 			</div>
// 		</Link>
// 	);
// }
