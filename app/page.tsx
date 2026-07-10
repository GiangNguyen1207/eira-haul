import Link from "next/link";
import { getCategories } from "@/sanity/lib/fetchers";
import {
	BRING_JAPANESE_VIBE,
	FROM_JP,
	FROM_JP_ENG,
	TO_YOUR_DOOR,
	DESCRIPTION,
	UNIQUE_SELLING_POINTS,
	FROM_OSAKA_SHELVES,
	TO_HELSINKI_DOORSTEPS,
	SHOP_PRODUCTS,
	HOW_IT_WORKS,
	CATEGORIES,
	SHOP_BY_CATEGORY,
	VIEW_ALL,
	NO_CATEGORIES_FOUND,
} from "@/constant";
import CategoryCard from "@/components/CategoryCard";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default async function Home() {
	const categories = await getCategories();

	return (
		<div>
			<section className="relative overflow-hidden border-b border-border/60">
				<div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-accent/40 blur-3xl" />
				<div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
					<div className="flex flex-col justify-center">
						<span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
							{FROM_JP} · {FROM_JP_ENG}
						</span>
						<h1 className="font-serif font-semibold text-5xl leading-[1.05] text-foreground sm:text-5xl lg:text-7xl">
							{BRING_JAPANESE_VIBE}
							<br />
							<span className="text-primary font-semibold">{TO_YOUR_DOOR}</span>
						</h1>
						<p className="mt-6 max-w-xl text-lg text-muted-foreground">
							{DESCRIPTION}
						</p>
						<div className="mt-10 flex flex-wrap gap-3">
							<Link
								href="/products"
								className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
							>
								{SHOP_PRODUCTS}
							</Link>
							<Link
								href="/how-it-works"
								className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
							>
								{HOW_IT_WORKS}
							</Link>
						</div>
					</div>
					<div className="relative flex items-center justify-center">
						<div className="relative aspect-4/5 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
							<div className="absolute inset-0 bg-linear-to-br from-primary/15 via-accent/40 to-background" />
							<div className="relative flex h-full flex-col p-8">
								<div className="flex-1">
									<p className="font-serif font-semibold text-2xl text-foreground">
										{FROM_OSAKA_SHELVES}
									</p>
									<p className="mt-1 text-sm text-muted-foreground">
										{TO_HELSINKI_DOORSTEPS}
									</p>
								</div>
								<div className="flex-2 space-y-3 text-sm">
									{UNIQUE_SELLING_POINTS.map((item) => (
										<div key={item} className="flex items-center gap-3">
											<span className="h-1.5 w-1.5 rounded-full bg-primary" />
											<span className="text-foreground/80">{item}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="border-b border-border/60">
				<div className="mx-auto max-w-6xl px-6 py-20">
					<div className="mb-12 flex items-end justify-between gap-6">
						<div>
							<p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
								{CATEGORIES}
							</p>
							<h2 className="mt-2 font-serif font-semibold text-3xl text-foreground sm:text-4xl">
								{SHOP_BY_CATEGORY}
							</h2>
						</div>
						<Link
							href="/products"
							className="hidden text-sm text-primary underline-offset-4 hover:underline sm:flex sm:items-center"
						>
							{VIEW_ALL}
							<ArrowRightIcon className="size-4 ml-1" />
						</Link>
					</div>
					{categories.length === 0 && (
						<p className="text-muted-foreground">{NO_CATEGORIES_FOUND}</p>
					)}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{categories.length > 0 &&
							categories.map((category) => (
								<CategoryCard key={category.id} category={category} />
							))}
					</div>
				</div>
			</section>
		</div>
	);
}
