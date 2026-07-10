import { cache } from "react";
import { sanityFetch } from "./live";
import {
	CATEGORIES_QUERY,
	CATEGORY_BY_SLUG_QUERY,
	PRODUCT_BY_SLUG_QUERY,
} from "./queries";
import type {
	CATEGORY_BY_SLUG_QUERY_RESULT,
	PRODUCT_BY_SLUG_QUERY_RESULT,
} from "@/sanity.types";

type NonNullableFields<T> = { [K in keyof T]-?: NonNullable<T[K]> };

export type Product = NonNullableFields<
	NonNullable<PRODUCT_BY_SLUG_QUERY_RESULT>
>;

type RawCategory = NonNullableFields<
	NonNullable<CATEGORY_BY_SLUG_QUERY_RESULT>
>;
export type Category = Omit<RawCategory, "products"> & { products: Product[] };

export const getCategories = cache(async () => {
	const { data } = await sanityFetch({ query: CATEGORIES_QUERY });
	return data as Category[];
});

export const getCategoryBySlug = cache(async (slug: string) => {
	const { data } = await sanityFetch({
		query: CATEGORY_BY_SLUG_QUERY,
		params: { slug },
	});
	return data as Category | null;
});

export const getProductBySlug = cache(async (productSlug: string) => {
	const { data } = await sanityFetch({
		query: PRODUCT_BY_SLUG_QUERY,
		params: { productSlug },
	});
	return data as Product | null;
});
