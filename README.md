# Goods & Co. — Week 5 Async Data Explorer

**Student name:** Replace with your full name

**API:** [DummyJSON Products](https://dummyjson.com/docs/products)

**GitHub repository:** Add your public repository URL

**Live app:** Add your deployed application URL

**Walkthrough video (3–5 minutes):** Add your video link

## About the app

Goods & Co. is a single-page product explorer built with HTML,
Tailwind CSS v4, Vite, and vanilla JavaScript ES modules.

It uses the built-in Fetch API and does not use Axios or a
JavaScript framework.

## Features

- Fetches products and categories on page load
- Reusable getJSON(url) function
- Checks response.ok and handles failed requests
- Parallel requests using Promise.all()
- Loading skeletons
- Error state with Retry button
- Empty state when no products match
- Responsive Tailwind CSS product-card grid
- Case-insensitive search
- Category filtering generated from API data
- Sorting by price, name, and rating
- Uses toSorted() without changing the original array
- Fetches individual product details by ID
- Statistics calculated using reduce()
- Uses map(), filter(), find(), reduce(), and toSorted()
- One state object and state-driven rendering
- Debounced search (300 milliseconds)
- Accessible labels, image alt text, and status announcements
- Uses textContent for API-provided text

## State and render flow

The state object stores product data, categories, loading status,
errors, search query, selected category, sort option, and product
details.

When the app opens, loadData() sets the loading status and requests
products and categories concurrently.

When requests succeed, the results are saved in state. If a request
fails, an error message is saved. The finally block renders the
updated state.

Search, filtering, and sorting update the current state and display
the results without fetching the entire product list again.

When a product card is clicked, the app fetches that product's
individual details.

## Example API JSON

This is an illustrative example of a product object:

```json
{
  "id": 1,
  "title": "Example product title",
  "description": "Example product description",
  "category": "beauty",
  "price": 9.99,
  "rating": 4.5,
  "stock": 25,
  "thumbnail": "https://example.com/product.jpg"
}