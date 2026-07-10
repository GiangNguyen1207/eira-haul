import { getCategories } from "@/sanity/lib/fetchers";
import ProductRow from "@/components/ProductRow";
import { NO_CATEGORIES_FOUND } from "@/constant";

export default async function ProductsPage() {
	const categories = await getCategories();

	if (categories.length === 0) {
		return <p className="text-muted-foreground">{NO_CATEGORIES_FOUND}</p>;
	}

	return (
		<div className="flex flex-col py-12 px-6 mx-auto max-w-6xl gap-14">
			{categories.map((category) => (
				<ProductRow key={category.id} category={category} />
			))}
		</div>
	);
}
