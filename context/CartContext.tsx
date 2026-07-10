"use client";

import { useCallback, useState, createContext, useContext } from "react";
import {
	addToCart,
	cartCount,
	cartTotal,
	clearCart,
	getCart,
	removeFromCart,
} from "@/lib/cart";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
	items: CartItem[];
	add: (item: CartItem) => void;
	remove: (id: number) => void;
	clear: () => void;
	total: number;
	count: number;
};

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [items, setItems] = useState<CartItem[]>(getCart);

	const add = useCallback((item: CartItem) => {
		setItems(addToCart(item));
	}, []);

	const remove = useCallback((id: number) => {
		setItems(removeFromCart(id));
	}, []);

	const clear = useCallback(() => {
		clearCart();
		setItems([]);
	}, []);

	return (
		<CartContext.Provider
			value={{
				items,
				add,
				remove,
				clear,
				total: cartTotal(items),
				count: cartCount(items),
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart(): CartContextValue {
	const context = useContext(CartContext);
	if (!context) throw new Error("useCart must be used within CartProvider");
	return context;
}
