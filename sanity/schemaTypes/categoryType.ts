import { defineField, defineType } from "sanity";

export const categoryType = defineType({
	name: "category",
	title: "Category",
	type: "document",
	fields: [
		defineField({
			name: "id",
			type: "number",
		}),
		defineField({
			name: "name",
			type: "string",
		}),
		defineField({
			name: "jpName",
			type: "string",
		}),
		defineField({
			name: "description",
			type: "string",
		}),
		defineField({
			name: "slug",
			type: "string",
		}),
		defineField({
			name: "products",
			type: "array",
			of: [{ type: "reference", to: [{ type: "product" }] }],
		}),
	],
});
