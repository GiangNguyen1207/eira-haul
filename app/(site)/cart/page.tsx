"use client";

import { toast } from "sonner";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCart } from "@/context/CartContext";
import {
	CART_PAGE_TITLE,
	CART_PAGE_TITLE_JP,
	REVIEW_ORDER,
	ERROR_PLACING_ORDER,
} from "@/constant";
import CartDetails from "@/components/CartDetails";
import CustomerDetails from "@/components/CustomerDetails";
import EmptyCart from "@/components/EmptyCart";
import { createOrder } from "@/lib/orders";
import type { CustomerDetailsInput } from "@/lib/types";

export default function CartPage() {
	const router = useRouter();
	const { items, total, count, clear } = useCart();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CustomerDetailsInput>();
	const [loading, setLoading] = useState(false);

	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	const onSubmit = async (data: CustomerDetailsInput) => {
		const reference = `EH-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
		setLoading(true);
		try {
			await createOrder({
				customer_name: data.name,
				customer_email: data.email,
				customer_phone: data.phone,
				items,
				total,
				reference,
			});
			clear();
			router.push(`/orders/${reference}`);
		} catch {
			toast.error(ERROR_PLACING_ORDER);
		} finally {
			setLoading(false);
		}
	};

	if (!mounted) {
		return (
			<div className="mx-auto w-6xl px-6 py-14">
				<div className="h-3 w-32 animate-pulse rounded bg-muted" />
				<div className="mt-2 mb-10 h-9 w-56 animate-pulse rounded bg-muted" />
				<div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
					<div className="h-64 animate-pulse rounded-xl bg-muted" />
					<div className="h-64 animate-pulse rounded-xl bg-muted" />
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl px-6 py-14">
			<p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
				{CART_PAGE_TITLE} · {CART_PAGE_TITLE_JP}
			</p>
			<h1 className="mt-2 mb-10 font-serif text-3xl text-foreground sm:text-4xl">
				{REVIEW_ORDER}
			</h1>
			{count === 0 && <EmptyCart />}
			{count > 0 && (
				<div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
					<CartDetails />
					<CustomerDetails
						register={register}
						errors={errors}
						submitForm={handleSubmit(onSubmit)}
						loading={loading}
					/>
				</div>
			)}
		</div>
	);
}
