"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { useCart } from "@/context/CartContext";
import { MOBILEPAY_NUMBER } from "@/constant";
import QuantityStepper from "@/components/QuantityStepper";

const checkoutSchema = z.object({
	name: z.string().min(1, "Name is required"),
	phone: z.string().min(1, "Phone number is required"),
	email: z.string().email("Enter a valid email address"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;
type FieldErrors = Partial<Record<keyof CheckoutForm, string>>;

export default function CartPage() {
	const { items, count, total, remove, clear } = useCart();
	const [form, setForm] = useState<CheckoutForm>({
		name: "",
		phone: "",
		email: "",
	});
	const [errors, setErrors] = useState<FieldErrors>({});
	const [submitted, setSubmitted] = useState<null | {
		name: string;
		reference: string;
		total: number;
	}>(null);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const parsed = checkoutSchema.safeParse(form);
		if (!parsed.success) {
			const fe: FieldErrors = {};
			for (const issue of parsed.error.issues) {
				const key = issue.path[0] as keyof FieldErrors;
				if (key && !fe[key]) fe[key] = issue.message;
			}
			setErrors(fe);
			return;
		}
		setErrors({});
		const ts = new Date().getTime().toString(36).toUpperCase();
		const reference = `VA-${ts}`;
		setSubmitted({ name: parsed.data.name, reference, total });
		clear();
	};

	if (submitted) {
		return (
			<div className="mx-auto max-w-3xl px-6 py-16">
				<div className="rounded-2xl border border-border bg-card p-8">
					<p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
						Order received · 注文受付
					</p>
					<h1 className="mt-3 font-serif text-3xl text-foreground">
						Thank you, {submitted.name}.
					</h1>
					<p className="mt-3 text-sm text-muted-foreground">
						Your reference is{" "}
						<span className="font-mono text-foreground">
							{submitted.reference}
						</span>
						. Please complete the MobilePay transfer of{" "}
						<span className="font-medium text-foreground">
							€{submitted.total.toFixed(2)}
						</span>{" "}
						to confirm your order.
					</p>
					<div className="mt-6 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
						<strong className="font-semibold">Important:</strong> your order can
						only be confirmed once payment is received. Include your reference{" "}
						<span className="font-mono">{submitted.reference}</span> in the
						MobilePay message.
					</div>
					<PaymentPanel
						amount={submitted.total}
						reference={submitted.reference}
					/>
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
			<div className="mb-10">
				<p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
					Your cart · カート
				</p>
				<h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
					Review your order
				</h1>
			</div>

			{count === 0 ? (
				<div className="rounded-xl border border-border bg-card p-10 text-center">
					<p className="font-serif text-2xl text-foreground">
						Your cart is empty
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						Browse the shop and add some Japanese favourites.
					</p>
					<Link
						href="/products"
						className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
					>
						Shop products
					</Link>
				</div>
			) : (
				<div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
					<section>
						<ul className="divide-y divide-border rounded-xl border border-border bg-card">
							{items.map((item) => (
								<li key={item.id} className="flex items-center gap-4 p-4">
									<div className="min-w-0 flex-1">
										<p className="truncate font-serif text-base text-foreground">
											{item.name ?? `Product #${item.id}`}
										</p>
										<p className="mt-1 text-xs text-muted-foreground">
											€{item.price.toFixed(2)} each
										</p>
									</div>
									{/* <QuantityStepper
										value={item.quantity}
										onChange={(q) => setQuantity(item.id, q)}
										min={0}
									/> */}
									<div className="w-20 text-right font-serif text-base text-foreground">
										€{(item.price * item.quantity).toFixed(2)}
									</div>
									<button
										type="button"
										onClick={() => remove(item.id)}
										className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
									>
										Remove
									</button>
								</li>
							))}
						</ul>
						<div className="mt-4 flex items-center justify-between px-1 text-sm">
							<span className="text-muted-foreground">{count} item(s)</span>
							<span className="font-serif text-xl text-foreground">
								Total €{total.toFixed(2)}
							</span>
						</div>
					</section>

					<aside className="space-y-6">
						<form
							onSubmit={onSubmit}
							className="rounded-xl border border-border bg-card p-6"
							noValidate
						>
							<h2 className="font-serif text-xl text-foreground">
								Confirmation details
							</h2>
							<p className="mt-1 text-xs text-muted-foreground">
								We&apos;ll use these to confirm your order and delivery.
							</p>

							{/* <div className="mt-5 space-y-4">
								<Field
									label="Full name"
									id="name"
									value={form.name}
									onChange={(v) => setForm((f) => ({ ...f, name: v }))}
									error={errors.name}
									autoComplete="name"
									maxLength={100}
								/>
								<Field
									label="Phone number"
									id="phone"
									type="tel"
									value={form.phone}
									onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
									error={errors.phone}
									autoComplete="tel"
									maxLength={30}
								/>
								<Field
									label="Email"
									id="email"
									type="email"
									value={form.email}
									onChange={(v) => setForm((f) => ({ ...f, email: v }))}
									error={errors.email}
									autoComplete="email"
									maxLength={255}
								/>
							</div> */}

							<button
								type="submit"
								className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
							>
								Place order · €{total.toFixed(2)}
							</button>
							<p className="mt-3 text-center text-[11px] text-muted-foreground">
								Your order is only confirmed once payment is received via
								MobilePay.
							</p>
						</form>

						<PaymentPanel amount={total} />
					</aside>
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

function Field({
	label,
	id,
	value,
	onChange,
	error,
	type = "text",
	autoComplete,
	maxLength,
}: {
	label: string;
	id: string;
	value: string;
	onChange: (v: string) => void;
	error?: string;
	type?: string;
	autoComplete?: string;
	maxLength?: number;
}) {
	return (
		<div>
			<label htmlFor={id} className="block text-xs font-medium text-foreground">
				{label}
			</label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				autoComplete={autoComplete}
				maxLength={maxLength}
				aria-invalid={error ? true : undefined}
				className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
			/>
			{error && <p className="mt-1 text-xs text-destructive">{error}</p>}
		</div>
	);
}
