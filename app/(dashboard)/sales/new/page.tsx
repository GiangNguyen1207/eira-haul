import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { toDatetimeLocal } from "@/lib/utils";
import SaleForm from "../SaleForm";

export default async function NewSalePage() {
	const db = createSupabaseAdmin();
	const { data: products } = await db
		.from("products")
		.select("id, name, sell_price, current_stock, categories(name)")
		.eq("active", true)
		.order("name");

	const options = (products ?? []).map((p) => ({
		id: p.id,
		name: p.name,
		sellPrice: Number(p.sell_price),
		currentStock: p.current_stock,
		category: (p.categories as unknown as { name: string } | null)?.name ?? "Uncategorised",
	}));

	return (
		<section className="space-y-5">
			<div>
				<p className="text-sm text-muted-foreground">
					<Link href="/sales" className="hover:text-foreground">Sales</Link>
					{" / New"}
				</p>
				<h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">Record sale</h1>
			</div>
			<SaleForm products={options} now={toDatetimeLocal(new Date())} />
		</section>
	);
}
