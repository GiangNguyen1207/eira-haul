"use client";

import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { Product } from "@/sanity/lib/fetchers";
import AddToCart from "@/components/AddToCart";

interface ProductDetailSectionProps {
	product: Product;
}

export default function ProductDetailSection({
	product,
}: ProductDetailSectionProps) {
	return (
		<div className="grid gap-10 lg:grid-cols-2">
			<div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
				{product.image ? (
					<Image
						src={urlFor(product.image).width(800).height(800).url()}
						alt={product.name}
						fill
						className="object-cover"
						priority
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 via-accent/30 to-background">
						<span className="font-serif text-[10rem] leading-none text-foreground/20"></span>
					</div>
				)}
			</div>
			<div className="flex flex-col">
				<div className="flex flex-col flex-2">
					<p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
						{product.category}
					</p>
					<h1 className="mt-2 font-serif font-medium text-4xl text-foreground sm:text-5xl">
						{product.name}
					</h1>
					<p className="mt-6 text-base leading-relaxed text-foreground/80">
						{product.description}
					</p>
				</div>
				<AddToCart product={product} />
			</div>
		</div>
	);
}
