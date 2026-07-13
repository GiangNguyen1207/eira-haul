"use client";

import { useState } from "react";
import { CheckIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";
import Button from "@/components/Button";
import QuantityStepper from "@/components/QuantityStepper";
import type { CartItem } from "@/lib/types";
import type { Product } from "@/sanity/lib/fetchers";

type Props = {
	product: Product;
};

export default function AddToCart({ product }: Readonly<Props>) {
	const { add } = useCart();
	const [quantity, setQuantity] = useState(1);
	const [added, setAdded] = useState(false);

	const handleAdd = () => {
		if (product.id == null || product.price == null || product.name == null)
			return;

		const cartItem: CartItem = {
			id: product.id,
			name: product.name,
			price: product.price,
			quantity,
		};
		add(cartItem);
		setAdded(true);
		window.setTimeout(() => setAdded(false), 1200);
	};

	return (
		<div className="flex items-center justify-between">
			<span className="font-serif font-semibold text-3xl text-foreground">
				€{product.price.toFixed(2)}
			</span>
			<div className="flex items-center gap-3">
				<QuantityStepper
					value={quantity}
					onChange={setQuantity}
					className="h-11"
				/>
				<Button
					label={added ? "Added to cart" : "Add to cart"}
					variant="primary"
					onClick={handleAdd}
					className="flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
				>
					{added ? (
						<CheckIcon className="size-4" />
					) : (
						<ShoppingCartIcon className="size-4" />
					)}
				</Button>
			</div>
		</div>
	);
}
