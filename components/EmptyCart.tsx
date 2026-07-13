import Link from "next/link";
import {
	SHOP_PRODUCTS,
	ORDER_FROM_JAPAN_DESCRIPTION,
	EMPTY_CART,
} from "@/constant";

export default function EmptyCart() {
	return (
		<div className="rounded-xl border border-border bg-card p-10 text-center">
			<p className="font-serif text-2xl text-foreground">{EMPTY_CART}</p>
			<p className="mt-2 text-sm text-muted-foreground">
				{ORDER_FROM_JAPAN_DESCRIPTION}
			</p>
			<Link
				href="/products"
				className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
			>
				{SHOP_PRODUCTS}
			</Link>
		</div>
	);
}
