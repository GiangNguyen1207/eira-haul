import { CartItem } from "./types";

const CART_KEY = "eira-haul-cart";

export function getCart(): CartItem[] {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
	} catch {
		return [];
	}
}

function saveCart(items: CartItem[]): void {
	localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem): CartItem[] {
	const cart = getCart();
	const existing = cart.find((i) => i.id === item.id);
	const updated = existing
		? cart.map((i) =>
				i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
			)
		: [...cart, { ...item, quantity: item.quantity }];
	saveCart(updated);
	return updated;
}

export function removeFromCart(id: number): CartItem[] {
	const updated = getCart().filter((i) => i.id !== id);
	saveCart(updated);
	return updated;
}

export function clearCart(): void {
	localStorage.removeItem(CART_KEY);
}

export function cartTotal(items: CartItem[]): number {
	return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
	return items.reduce((sum, i) => sum + i.quantity, 0);
}
