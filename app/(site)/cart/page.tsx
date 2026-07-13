"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "@/context/CartContext";
import {
	CART_PAGE_TITLE,
	CART_PAGE_TITLE_JP,
	MOBILEPAY_NUMBER,
	REVIEW_ORDER,
} from "@/constant";
import CartDetails from "@/components/CartDetails";
import CustomerDetails from "@/components/CustomerDetails";
import EmptyCart from "@/components/EmptyCart";
import { createOrder } from "@/lib/orders";
import type { CustomerDetailsInput } from "@/lib/types";

type Confirmed = { name: string; reference: string; total: number };

export default function CartPage() {
	const { items, total, count, clear } = useCart();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CustomerDetailsInput>();

	const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (data: CustomerDetailsInput) => {
		const reference = `VA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
		setLoading(true);
		setError(null);
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
			setConfirmed({ name: data.name, reference, total });
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (confirmed) {
		return (
			<div className="mx-auto max-w-3xl px-6 py-16">
				<div className="rounded-2xl border border-border bg-card p-8">
					<p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
						Order received · 注文受付
					</p>
					<h1 className="mt-3 font-serif text-3xl text-foreground">
						Thank you, {confirmed.name}.
					</h1>
					<p className="mt-3 text-sm text-muted-foreground">
						Your reference is{" "}
						<span className="font-mono text-foreground">{confirmed.reference}</span>
						. Please complete the MobilePay transfer of{" "}
						<span className="font-medium text-foreground">
							€{confirmed.total.toFixed(2)}
						</span>{" "}
						to confirm your order.
					</p>
					<div className="mt-6 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
						<strong className="font-semibold">Important:</strong> your order can
						only be confirmed once payment is received. Include your reference{" "}
						<span className="font-mono">{confirmed.reference}</span> in the
						MobilePay message.
					</div>
					<PaymentPanel amount={confirmed.total} reference={confirmed.reference} />
					<div className="mt-8">
						<Link
							href="/products"
							className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
						>
							Continue shopping
						</Link>
					</div>
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
						error={error}
					/>
				</div>
			)}
		</div>
	);
}

function PaymentPanel({
	amount,
	reference,
}: {
	amount: number;
	reference?: string;
}) {
	const qrData = encodeURIComponent(MOBILEPAY_NUMBER);
	return (
		<div className="mt-6 rounded-xl border border-border bg-card p-6">
			<div className="flex items-center justify-between">
				<h2 className="font-serif text-xl text-foreground">
					Pay with MobilePay
				</h2>
				<span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] uppercase tracking-widest text-primary">
					Required
				</span>
			</div>
			<p className="mt-1 text-xs text-muted-foreground">
				Scan the QR code or send to the number below.
			</p>
			<div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${qrData}`}
					alt={`MobilePay QR code for ${MOBILEPAY_NUMBER}`}
					width={160}
					height={160}
					className="h-40 w-40 rounded-lg border border-border bg-white p-2"
				/>
				<dl className="grid flex-1 gap-3 text-sm">
					<div>
						<dt className="text-xs uppercase tracking-widest text-muted-foreground">
							MobilePay number
						</dt>
						<dd className="font-serif text-lg text-foreground">
							{MOBILEPAY_NUMBER}
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-widest text-muted-foreground">
							Amount
						</dt>
						<dd className="font-serif text-lg text-foreground">
							€{amount.toFixed(2)}
						</dd>
					</div>
					{reference && (
						<div>
							<dt className="text-xs uppercase tracking-widest text-muted-foreground">
								Reference (add to message)
							</dt>
							<dd className="font-mono text-sm text-foreground">{reference}</dd>
						</div>
					)}
				</dl>
			</div>
			<p className="mt-4 text-[11px] text-muted-foreground">
				Note: orders can only be confirmed after we receive your MobilePay
				payment.
			</p>
		</div>
	);
}
