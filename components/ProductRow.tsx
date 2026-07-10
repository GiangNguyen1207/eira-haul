import { Category, Product } from "@/sanity/lib/fetchers";
import { ProductCard } from "./ProductCard";
import { PRODUCT_NOT_FOUND } from "@/constant";

type Props = {
	category: Category;
};

export default function ProductRow({ category }: Readonly<Props>) {
	return (
		<div>
			<div className="mb-6">
				<h2 className="font-serif font-semibold text-2xl text-foreground">
					{category.name}
				</h2>
				<p className="text-sm font-medium text-muted-foreground">
					{category.jpName} · {category.description}
				</p>
			</div>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{category.products && category.products.length > 0 ? (
					category.products.map((product: Product) => (
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
