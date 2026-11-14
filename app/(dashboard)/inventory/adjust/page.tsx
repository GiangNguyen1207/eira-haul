import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { toDatetimeLocal } from "@/lib/utils";
import AdjustForm from "./AdjustForm";

export default async function AdjustStockPage() {
	const db = createSupabaseAdmin();
	const { data: products } = await db
		.from("products")
		.select("id, name, current_stock, categories(name)")
		.eq("active", true)
		.order("name");

	const options = (products ?? []).map((p) => ({
		id: p.id,
		name: p.name,
		currentStock: p.current_stock,
		category: (p.categories as unknown as { name: string } | null)?.name ?? "Uncategorised",
	}));

	return (
		<section className="space-y-5">
			<div>
				<p className="text-sm text-muted-foreground">
					<Link href="/inventory" className="hover:text-foreground">Inventory</Link>
					{" / Adjust stock"}
				</p>
				<h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">Adjust stock</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Correct a stock count or write off damaged items.
				</p>
			</div>
			<AdjustForm products={options} now={toDatetimeLocal(new Date())} />
		</section>
	);
}
