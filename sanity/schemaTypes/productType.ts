import { defineField, defineType } from "sanity";

export const productType = defineType({
	name: "product",
	title: "Product",
	type: "document",
	fields: [
		defineField({
			name: "id",
			type: "number",
		}),
		defineField({
			name: "productSlug",
			type: "string",
		}),
		defineField({
			name: "category",
			type: "string",
			options: {
				list: [
					{ title: "Skincare", value: "skincare" },
					{ title: "Snacks", value: "snacks" },
					{ title: "Supplements", value: "supplements" },
					{ title: "Matcha", value: "matcha" },
				],
			},
		}),
		defineField({
			name: "name",
			type: "string",
		}),
		defineField({
			name: "description",
			type: "string",
		}),
		defineField({
			name: "ingredients",
			type: "string",
		}),
		defineField({
			name: "howToUse",
			type: "array",
			of: [{ type: "block" }],
    }),
    defineField({
			name: "howToMake",
			type: "array",
			of: [{ type: "block" }],
    }),
    defineField({
			name: "howToStore",
			type: "text",
		}),
		defineField({
			name: "price",
			type: "number",
		}),
		defineField({
			name: "image",
			type: "image",
			options: {
				hotspot: true,
			},
		}),
	],
});
