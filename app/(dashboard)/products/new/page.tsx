import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
	const db = createSupabaseAdmin();
	const { data: categories } = await db.from("categories").select("name").order("name");

	return (
		<section className="space-y-5">
			<div>
				<p className="text-sm text-muted-foreground">
					<Link href="/products" className="hover:text-foreground">Products</Link>
					{" / New"}
				</p>
				<h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">Add product</h1>
			</div>
			<ProductForm categories={categories?.map((c) => c.name) ?? []} />
		</section>
	);
}
