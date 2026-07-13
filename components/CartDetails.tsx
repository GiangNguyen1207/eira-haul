import ProductCartRow from "@/components/ProductCartRow";
import { useCart } from "@/context/CartContext";

export default function CartDetails() {
	const { items, count, total } = useCart();

	return (
		<div>
			<div className="divide-y divide-border rounded-xl border border-border bg-card">
				{items.map((item) => (
					<ProductCartRow key={item.id} item={item} />
				))}
			</div>
			<div className="mt-4 flex items-center justify-between px-1 text-sm">
				<span className="text-muted-foreground">{count} item(s)</span>
				<span className="font-serif text-xl text-foreground font-semibold">
					Total: €{total.toFixed(2)}
				</span>
			</div>
		</div>
	);
}
