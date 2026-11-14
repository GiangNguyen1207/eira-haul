import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import ProductForm from "../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const db = createSupabaseAdmin();

	const [{ data: product }, { data: categories }] = await Promise.all([
		db.from("products").select("*, categories(name)").eq("id", id).maybeSingle(),
		db.from("categories").select("name").order("name"),
	]);

	if (!product) notFound();

	const defaultValues = {
		name: product.name,
		categoryName: (product.categories as { name: string } | null)?.name ?? "",
		sku: product.sku ?? "",
		unit: product.unit as "piece" | "pack" | "box" | "set",
		costPrice: Number(product.cost_price),
		sellPrice: Number(product.sell_price),
		currentStock: product.current_stock,
		reorderThreshold: product.reorder_threshold,
		active: product.active,
	};

	return (
		<section className="space-y-5">
			<div>
				<p className="text-sm text-muted-foreground">
					<Link href="/products" className="hover:text-foreground">Products</Link>
					{" / Edit"}
				</p>
				<h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">{product.name}</h1>
			</div>
			<ProductForm
				id={id}
				defaultValues={defaultValues}
				categories={categories?.map((c) => c.name) ?? []}
			/>
		</section>
	);
}
