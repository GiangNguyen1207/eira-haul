import { TrashIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import { useCart } from "@/context/CartContext";
import QuantityStepper from "./QuantityStepper";
import type { CartItem } from "@/lib/types";
interface ProductCartRowProps {
	item: CartItem;
}

export default function ProductCartRow({ item }: ProductCartRowProps) {
	const { id, name, price, quantity } = item;
	const { add, remove } = useCart();

	return (
		<div className="flex min-w-0 items-center gap-4 overflow-hidden p-4">
			<div className="min-w-0 flex-1">
				<p className="font-serif text-base text-foreground font-semibold">
					{name}
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					€{price.toFixed(2)} each
				</p>
			</div>
			<QuantityStepper value={quantity} onChange={() => add(item)} min={0} />
			<div className="w-20 text-right font-serif font-semibold text-base text-foreground">
				€{price.toFixed(2)}
			</div>
			<Button label="" variant="ghost" onClick={() => remove(id)}>
				<TrashIcon className="size-6" />
			</Button>
		</div>
	);
}
