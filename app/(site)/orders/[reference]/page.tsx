import { notFound } from "next/navigation";
import { getOrderByReference } from "@/lib/orders";
import PaymentPanel from "@/components/PaymentPanel";
import Link from "next/link";
import {
	ORDER_RECEIVED,
	ORDER_RECEIVED_JP,
	THANK_YOU,
	COMPLETE_ORDER,
	TO_CONFIRM_ORDER,
	IMPORTANT,
	NOTE,
	CONTINUE_SHOPPING,
} from "@/constant";

export default async function OrderPage({
	params,
}: {
	params: Promise<{ reference: string }>;
}) {
	const { reference } = await params;
	const order = await getOrderByReference(reference);

	if (!order) notFound();

	return (
		<div className="mx-auto max-w-3xl px-6 py-16">
			<div className="rounded-2xl border border-border bg-card p-8">
				<p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
					{ORDER_RECEIVED} · {ORDER_RECEIVED_JP}
				</p>
				<h1 className="mt-3 font-serif font-semibold text-3xl text-foreground">
					{THANK_YOU} {order.customer_name}.
				</h1>
				<p className="mt-3 text-sm text-muted-foreground">
					{COMPLETE_ORDER.replace("{amount}", `€${order.total.toFixed(2)}`)}
				</p>
				<div className="mt-4 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
					<strong className="font-semibold">{IMPORTANT}</strong>{" "}
					{NOTE.replace("{reference}", reference)}
				</div>
				<PaymentPanel amount={order.total} reference={reference} />
				<div className="mt-8">
					<Link
						href="/products"
						className="inline-flex items-center justify-center rounded-md border border-border bg-primary px-4 py-2 text-sm text-muted font-medium transition hover:border-primary hover:bg-primary/30"
					>
						{CONTINUE_SHOPPING}
					</Link>
				</div>
			</div>
		</div>
	);
}
