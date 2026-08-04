import ProductRow from "@/components/ProductRow";
import { NO_CATEGORY_FOUND } from "@/constant";
import { getCategoryBySlug } from "@/sanity/lib/fetchers";

export default async function CategoryPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const category = await getCategoryBySlug(slug);

	if (!category?.name || !category?.jpName) {
		return <p className="text-muted-foreground">{NO_CATEGORY_FOUND}</p>;
	}

	return (
		<div className="flex flex-col py-12 px-6 mx-auto max-w-6xl gap-14">
			<ProductRow category={category} showAllProducts />
		</div>
	);
}
