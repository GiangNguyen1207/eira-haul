import Link from "next/link";
import {
	OUR_PROCESS_JP,
	OUR_PROCESS_EN,
	OUR_PROCESS_TITLE,
	OUR_PROCESS_DESCRIPTION,
	STEPS,
	SHOP_PRODUCTS,
	ORDER_FROM_JAPAN,
	ORDER_FROM_JAPAN_DESCRIPTION,
} from "@/constant";
import ProcessSteps from "@/components/ProcessSteps";

export default function OurProcessPage() {
	return (
		<div>
			<section className="border-b border-border/60 bg-secondary/30">
				<div className="mx-auto max-w-4xl px-6 py-16 text-center">
					<p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
						{OUR_PROCESS_JP} · {OUR_PROCESS_EN}
					</p>
					<h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
						{OUR_PROCESS_TITLE}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
						{OUR_PROCESS_DESCRIPTION}
					</p>
				</div>
			</section>

			<section className="mx-auto max-w-4xl px-6 py-16">
				<ProcessSteps steps={STEPS} />
				<div className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
					<p className="font-display text-2xl text-foreground">
						{ORDER_FROM_JAPAN}
					</p>
					<p className="max-w-xl text-sm text-muted-foreground">
						{ORDER_FROM_JAPAN_DESCRIPTION}
					</p>
					<Link
						href="/products"
						className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
					>
						{SHOP_PRODUCTS}
					</Link>
				</div>
			</section>
		</div>
	);
}
