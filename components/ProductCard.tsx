import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import type { Product } from "@/sanity/lib/fetchers";
import AddToCart from "./AddToCart";

interface ProductCardProps {
	product: Product;
	categorySlug: string;
}

export function ProductCard({ product, categorySlug }: ProductCardProps) {
	const { productSlug, name, description, image } = product;

	return (
		<article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50 hover:shadow-sm">
			<Link
				href={`/products/${categorySlug}/${productSlug}`}
				className="relative aspect-4/3 w-full overflow-hidden bg-secondary"
			>
				{image ? (
					<Image
						src={urlFor(image).width(400).height(300).url()}
						alt={name ?? ""}
						fill
						className="object-cover transition group-hover:scale-105"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 via-accent/30 to-background">
						<span className="font-serif text-5xl text-foreground/20 transition group-hover:scale-105">
							和
						</span>
					</div>
				)}
			</Link>
			<div className="flex flex-1 flex-col p-5">
				<Link
					href={`/products/${categorySlug}/${productSlug}`}
					className="line-clamp-2 font-serif font-semibold text-lg leading-tight text-foreground transition hover:text-primary"
				>
					{name}
				</Link>
				{description && (
					<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
						{description}
					</p>
				)}
				<p className="mt-auto pt-5 font-serif font-semibold text-xl text-foreground">
					€{product.price.toFixed(2)}
				</p>
			</div>
		</article>
	);
}
