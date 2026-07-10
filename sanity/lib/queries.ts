import { defineQuery } from "next-sanity";

export const CATEGORIES_QUERY = defineQuery(`*[_type == "category"]{
  id,
  name,
  jpName,
  description,
  slug,
  products[]->{
    id,
    productSlug,
    name,
    description,
    price,
    image,
    category  
  }
}`);

export const CATEGORY_BY_SLUG_QUERY =
	defineQuery(`*[_type == "category" && slug == $slug][0]{
  id,
  name,
  jpName,
  description,
  slug,
  products[]->{
    id,
    productSlug,
    name,
    description,
    price,
    image,
    category  
  }
}`);

export const PRODUCT_BY_SLUG_QUERY =
	defineQuery(`*[_type == "product" && productSlug == $productSlug][0]{
  id,
  productSlug,
  name,
  description,
  price,
  image,
  category
}`);
