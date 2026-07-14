"use client";

import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { Product } from "@/sanity/lib/fetchers";
import AddToCart from "@/components/AddToCart";
import Expandable from "@/components/Expandable";

interface ProductDetailSectionProps {
	product: Product;
}

export default function ProductDetailSection({
	product,
}: ProductDetailSectionProps) {
	const { name, description, category, image, ingredients, howToUse } = product;

	return (
		<div className="grid gap-10 lg:grid-cols-2">
			<div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
				{image ? (
					<Image
						src={urlFor(image).width(800).height(800).url()}
						alt={name}
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
						{category}
					</p>
					<h1 className="mt-2 font-serif font-medium text-4xl text-foreground sm:text-5xl">
						{name}
					</h1>
					<p className="mt-6 text-base leading-relaxed text-foreground/80">
						{description}
					</p>
				</div>
				<AddToCart product={product} />
			</div>
			<div className="mt-6 col-span-full">
				{ingredients && (
					<Expandable label="Ingredients" content={ingredients} />
				)}
				{howToUse && <Expandable label="How to use" content={howToUse} />}
			</div>
		</div>
	);
}
