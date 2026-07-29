import Link from "next/link";
import { Category, Product } from "@/sanity/lib/fetchers";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "./ProductCard";
import { PRODUCT_NOT_FOUND, VIEW_ALL } from "@/constant";

type Props = {
	category: Category;
};

export default function ProductRow({ category }: Readonly<Props>) {
	const products = category.products?.slice(0, 4) ?? [];

	return (
		<div>
			<div className="mb-6 flex items-end justify-between">
				<div>
					<h2 className="font-serif font-semibold text-2xl text-foreground">
						{category.name}
					</h2>
					<p className="text-sm font-medium text-muted-foreground">
						{category.jpName} · {category.description}
					</p>
				</div>
				<Link
					href={`/products/${category.slug}`}
					className="flex items-center text-sm font-medium text-muted-foreground transition hover:text-primary"
				>
					{VIEW_ALL}
					<ArrowRightIcon className="size-4 ml-1" />
				</Link>
			</div>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{products.length > 0 ? (
					products.map((product: Product) => (
						<ProductCard
							key={product.id}
							product={product}
							categorySlug={category.slug}
						/>
					))
				) : (
					<p className="text-sm text-muted-foreground">{PRODUCT_NOT_FOUND}</p>
				)}
			</div>
		</div>
	);
}
