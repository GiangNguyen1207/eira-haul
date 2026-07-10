import { BROWSE } from "@/constant";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Category } from "@/sanity/lib/fetchers";

interface CategoryCardProps {
	category: Category;
}

export default function CategoryCard({
	category: { name: label, jpName: description, slug },
}: CategoryCardProps) {
	return (
		<Link
			href={`/products/${slug}`}
			className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition hover:border-primary/60 hover:shadow-sm"
		>
			<p className="font-serif font-semibold text-3xl text-foreground">
				{label}
			</p>
			<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			<div className="mt-8 flex items-center text-sm text-primary opacity-0 transition group-hover:opacity-100">
				{BROWSE}
				<ArrowRightIcon className="size-4 ml-1" />
			</div>
		</Link>
	);
}
