import './style.css';

import {
  getProductsAndCategories,
  getProduct,
} from './api.js';

import { render } from './render.js';

const state = {
  items: [],
  categories: [],
  status: 'loading',
  error: null,
  query: '',
  filter: 'all',
  sort: 'default',
  selectedProduct: null,
  detailsLoading: false,
  detailsTitle: null,
  detailsError: null,
  visibleCount: 0,

  onChange: () => render(state),
  onSearch: (value) => handleSearch(value),
  onRetry: () => loadData(),
  onOpenDetails: (id) => loadDetails(id),
  onCloseDetails: () => closeDetails(),
};

let searchTimer;

// Bonus: wait 300 ms after typing stops before updating results.
function handleSearch(value) {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    state.query = value;
    render(state);
  }, 300);
}

async function loadData() {
  state.status = 'loading';
  state.error = null;

  render(state);

  try {
    const { products, categories } =
      await getProductsAndCategories();

    // Spread syntax copies the arrays into state.
    state.items = [...products];
    state.categories = [...categories];

    state.status = 'success';
  } catch (error) {
    state.status = 'error';

    state.error =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred.';
  } finally {
    render(state);
  }
}

async function loadDetails(id) {
  state.selectedProduct = null;
  state.detailsError = null;
  state.detailsLoading = true;

  // find() locates the cached product title.
  state.detailsTitle =
    state.items.find(
      ({ id: productId }) =>
        String(productId) === String(id)
    )?.title ?? 'product';

  render(state);

  try {
    state.selectedProduct = await getProduct(id);
  } catch (error) {
    state.detailsError =
      error instanceof Error
        ? error.message
        : 'Could not load product details.';
  } finally {
    state.detailsLoading = false;

    render(state);

    document.querySelector('#product-details')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

function closeDetails() {
  state.selectedProduct = null;
  state.detailsLoading = false;
  state.detailsTitle = null;
  state.detailsError = null;

  render(state);
}

// Load the app data when the page starts.
loadData();