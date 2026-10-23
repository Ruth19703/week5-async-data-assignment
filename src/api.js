
const BASE = "https://dummyjson.com";

// Fetch data from the API
export async function getJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
}

// Fetch products
export const getProducts = () =>
  getJSON(`${BASE}/products?limit=100`);

// Fetch product categories
export const getCategories = () =>
  getJSON(`${BASE}/products/categories`);

// Fetch one product by ID
export const getProduct = (id) =>
  getJSON(`${BASE}/products/${id}`);

// Fetch products and categories at the same time
export async function getProductsAndCategories() {
  const [productData, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return {
    products: productData.products ?? [],
    categories: categories.map((category) =>
      typeof category === "string" ? category : category.slug
    ),
  };
}
