import { formatPrice } from './utils.js';

const app = document.querySelector('#app');

/**
 * Filter products by search and category, then sort a copy.
 */
export function getVisibleItems({ items, query, filter, sort }) {
  const searchTerm = query.trim().toLowerCase();

  const filteredItems = items
    .filter(({ title = '', brand = '', description = '' }) =>
      `${title} ${brand} ${description}`
        .toLowerCase()
        .includes(searchTerm)
    )
    .filter(
      ({ category }) =>
        filter === 'all' || category === filter
    );

  const sorters = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'name-asc': (a, b) =>
      (a.title ?? '').localeCompare(b.title ?? ''),
    'rating-desc': (a, b) =>
      (b.rating ?? 0) - (a.rating ?? 0),
  };

  return sorters[sort]
    ? filteredItems.toSorted(sorters[sort])
    : filteredItems;
}

/**
 * Create an HTML element and optionally add Tailwind classes and text.
 */
function el(tag, classes = '', text) {
  const node = document.createElement(tag);

  if (classes) node.className = classes;
  if (text !== undefined) node.textContent = text;

  return node;
}

/**
 * Header.
 */
function makeHeader() {
  const header = el('header', 'bg-[#172d27] text-white');

  const inner = el(
    'div',
    'mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8'
  );

  const brand = el('div', 'flex items-center gap-3');

  brand.append(
    el(
      'div',
      'flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d9b879] text-xl font-black text-[#172d27]',
      'G'
    )
  );

  const words = el('div');

  words.append(
    el('p', 'text-lg font-bold tracking-tight', 'Goods & Co.')
  );

  words.append(
    el('p', 'text-xs text-stone-300', 'Product data explorer')
  );

  brand.append(words);

  inner.append(
    brand,
    el(
      'span',
      'rounded-full border border-white/20 px-3 py-1 text-xs text-stone-200',
      'Week 5 project'
    )
  );

  header.append(inner);

  return header;
}

/**
 * One statistic card.
 */
function makeStat(label, value, hint) {
  const card = el(
    'article',
    'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm'
  );

  card.append(
    el('p', 'text-sm font-medium text-stone-500', label)
  );

  card.append(
    el('p', 'mt-2 text-2xl font-bold text-[#172d27]', value)
  );

  card.append(
    el('p', 'mt-1 text-xs text-stone-400', hint)
  );

  return card;
}

/**
 * Calculate statistics using reduce().
 */
function renderStats(state, visibleItems) {
  const stats = el(
    'section',
    'grid grid-cols-1 gap-4 sm:grid-cols-3'
  );

  const rated = state.items.filter(
    ({ rating }) => Number.isFinite(rating)
  );

  const ratingTotal = rated.reduce(
    (total, { rating }) => total + rating,
    0
  );

  const average = rated.length
    ? (ratingTotal / rated.length).toFixed(1)
    : '—';

  const inventoryValue = state.items.reduce(
    (total, { price = 0, stock = 0 }) =>
      total + price * stock,
    0
  );

  stats.append(
    makeStat(
      'Products loaded',
      state.items.length.toLocaleString(),
      'Products received from the API'
    ),
    makeStat(
      'Average rating',
      average === '—' ? average : `${average} / 5`,
      'Calculated using reduce()'
    ),
    makeStat(
      'Products shown',
      visibleItems.length.toLocaleString(),
      `Inventory value: ${formatPrice(inventoryValue)}`
    )
  );

  return stats;
}

/**
 * Search, category filter, and sort controls.
 */
function makeControls(state) {
  const controls = el(
    'section',
    'grid grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1.5fr)_minmax(180px,1fr)_minmax(180px,1fr)]'
  );

  // Search field.
  const searchWrap = el('div', 'min-w-0');

  const searchLabel = el(
    'label',
    'mb-2 block text-sm font-semibold text-stone-700',
    'Search products'
  );

  searchLabel.htmlFor = 'product-search';

  const search = el(
    'input',
    'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-stone-400 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-900/10'
  );

  search.id = 'product-search';
  search.type = 'search';
  search.placeholder = 'Try “phone” or “beauty”';
  search.autocomplete = 'off';
  search.value = state.query;

  search.setAttribute(
    'aria-label',
    'Search products by name, brand, or description'
  );

  searchWrap.append(searchLabel, search);

  // Category selector.
  const categoryWrap = el('div');

  const categoryLabel = el(
    'label',
    'mb-2 block text-sm font-semibold text-stone-700',
    'Category'
  );

  categoryLabel.htmlFor = 'category-filter';

  const categorySelect = el(
    'select',
    'w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-4 focus:ring-emerald-900/10'
  );

  categorySelect.id = 'category-filter';

  const allOption = el('option', '', 'All categories');
  allOption.value = 'all';
  allOption.selected = state.filter === 'all';

  categorySelect.append(allOption);

  state.categories.forEach((category) => {
    const option = el(
      'option',
      '',
      category.replaceAll('-', ' ')
    );

    option.value = category;
    option.selected = state.filter === category;

    categorySelect.append(option);
  });

  categoryWrap.append(categoryLabel, categorySelect);

  // Sorting selector.
  const sortWrap = el('div');

  const sortLabel = el(
    'label',
    'mb-2 block text-sm font-semibold text-stone-700',
    'Sort by'
  );

  sortLabel.htmlFor = 'sort-products';

  const sortSelect = el(
    'select',
    'w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-4 focus:ring-emerald-900/10'
  );

  sortSelect.id = 'sort-products';

  const sortOptions = [
    ['default', 'Recommended order'],
    ['price-asc', 'Price: low to high'],
    ['price-desc', 'Price: high to low'],
    ['name-asc', 'Name: A–Z'],
    ['rating-desc', 'Highest rating'],
  ];

  sortOptions.forEach(([value, label]) => {
    const option = el('option', '', label);

    option.value = value;
    option.selected = state.sort === value;

    sortSelect.append(option);
  });

  sortWrap.append(sortLabel, sortSelect);

  controls.append(searchWrap, categoryWrap, sortWrap);

  return { controls, search, categorySelect, sortSelect };
}

/**
 * One product card.
 */
function makeProductCard(product) {
  const {
    id,
    title = 'Untitled product',
    brand = 'Brand not listed',
    category = 'Uncategorised',
    price = 0,
    rating,
    thumbnail,
    stock,
  } = product;

  const card = el(
    'article',
    'group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg'
  );

  const button = el(
    'button',
    'block w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-emerald-700'
  );

  button.type = 'button';
  button.dataset.productId = String(id);

  button.setAttribute(
    'aria-label',
    `View details for ${title}`
  );

  const imageWrap = el(
    'div',
    'relative flex h-52 items-center justify-center overflow-hidden bg-stone-100 p-5'
  );

  const image = el(
    'img',
    'h-full w-full object-contain transition duration-300 group-hover:scale-105'
  );

  image.src = thumbnail || '';
  image.alt = `${title} product image`;
  image.loading = 'lazy';

  image.addEventListener(
    'error',
    () => {
      image.removeAttribute('src');
      image.alt = `${title} image unavailable`;

      imageWrap.replaceChildren(
        el('span', 'text-sm text-stone-400', 'Image unavailable')
      );
    },
    { once: true }
  );

  imageWrap.append(
    image,
    el(
      'span',
      'absolute left-3 top-3 max-w-[80%] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-stone-600 shadow-sm',
      category.replaceAll('-', ' ')
    )
  );

  const content = el('div', 'p-4');

  content.append(
    el('p', 'truncate text-xs font-medium text-stone-400', brand)
  );

  content.append(
    el(
      'h3',
      'mt-1 min-h-12 text-base font-semibold leading-6 text-stone-900',
      title
    )
  );

  const row = el(
    'div',
    'mt-3 flex items-end justify-between gap-3'
  );

  const priceStock = el('div');

  priceStock.append(
    el('p', 'text-lg font-bold text-[#172d27]', formatPrice(price))
  );

  priceStock.append(
    el('p', 'mt-1 text-xs text-stone-500', `${stock ?? '—'} in stock`)
  );

  row.append(
    priceStock,
    el(
      'span',
      'shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-sm font-semibold text-amber-800',
      Number.isFinite(rating) ? `★ ${rating.toFixed(1)}` : 'Not rated'
    )
  );

  content.append(row);
  button.append(imageWrap, content);
  card.append(button);

  return card;
}

/**
 * Loading skeletons.
 */
function renderSkeletons() {
  const grid = el(
    'div',
    'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  );

  for (let i = 0; i < 8; i += 1) {
    const card = el(
      'div',
      'animate-pulse rounded-2xl border border-stone-200 bg-white p-4'
    );

    card.append(el('div', 'h-44 rounded-xl bg-stone-200'));
    card.append(el('div', 'mt-4 h-3 w-1/3 rounded bg-stone-200'));
    card.append(el('div', 'mt-3 h-5 w-4/5 rounded bg-stone-200'));
    card.append(el('div', 'mt-5 h-6 w-1/2 rounded bg-stone-200'));

    grid.append(card);
  }

  return grid;
}

/**
 * Accessible loading/success/error status message.
 */
function renderStatus(state) {
  const status = el('p', 'text-sm text-stone-600');

  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  if (state.status === 'loading') {
    status.textContent = 'Loading products and categories…';
  } else if (state.status === 'error') {
    status.textContent = state.error || 'Something went wrong.';
  } else {
    status.textContent =
      `${state.visibleCount} product${state.visibleCount === 1 ? '' : 's'} shown`;
  }

  return status;
}

/**
 * Error state and Retry button.
 */
function renderError(state) {
  const panel = el(
    'section',
    'rounded-2xl border border-red-200 bg-red-50 p-8 text-center'
  );

  panel.append(
    el(
      'div',
      'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl text-red-700',
      '!'
    )
  );

  panel.append(
    el(
      'h2',
      'mt-4 text-lg font-bold text-red-950',
      'We couldn’t load the products'
    )
  );

  panel.append(
    el(
      'p',
      'mx-auto mt-2 max-w-lg text-sm leading-6 text-red-800',
      state.error || 'Please check your connection and try again.'
    )
  );

  const retry = el(
    'button',
    'mt-5 rounded-xl bg-[#172d27] px-5 py-3 text-sm font-semibold text-white hover:bg-[#29463b] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/30',
    'Try again'
  );

  retry.id = 'retry-button';
  retry.type = 'button';

  panel.append(retry);

  return panel;
}

/**
 * Empty search/filter state.
 */
function renderEmpty() {
  const panel = el(
    'div',
    'rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center'
  );

  panel.append(el('div', 'text-3xl', '⌕'));

  panel.append(
    el('h2', 'mt-3 text-lg font-bold text-stone-800', 'No products found')
  );

  panel.append(
    el(
      'p',
      'mt-2 text-sm text-stone-500',
      'Try another search term or choose a different category.'
    )
  );

  return panel;
}

/**
 * Product details section.
 */
function renderDetails(state) {
  if (
    !state.selectedProduct &&
    !state.detailsLoading &&
    !state.detailsError
  ) {
    return null;
  }

  const panel = el(
    'section',
    'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7'
  );

  panel.id = 'product-details';
  panel.setAttribute('aria-labelledby', 'details-heading');

  const top = el('div', 'flex items-start justify-between gap-4');

  const heading = el(
    'h2',
    'text-xl font-bold text-[#172d27]',
    'Product details'
  );

  heading.id = 'details-heading';

  const close = el(
    'button',
    'rounded-lg border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/30',
    'Close'
  );

  close.id = 'close-details';
  close.type = 'button';

  top.append(heading, close);
  panel.append(top);

  if (state.detailsLoading) {
    panel.append(
      el(
        'p',
        'mt-4 text-sm text-stone-500',
        `Loading details for ${state.detailsTitle ?? 'product'}…`
      )
    );
  } else if (state.detailsError) {
    panel.append(
      el('p', 'mt-4 text-sm text-red-700', state.detailsError)
    );
  } else {
    const p = state.selectedProduct;

    const body = el(
      'div',
      'mt-5 grid gap-6 sm:grid-cols-[180px_1fr]'
    );

    const image = el(
      'img',
      'max-h-52 w-full rounded-xl bg-stone-100 object-contain p-3'
    );

    image.src = p.images?.[0] || p.thumbnail || '';
    image.alt = `${p.title || 'Product'} product image`;

    image.addEventListener(
      'error',
      () => image.removeAttribute('src'),
      { once: true }
    );

    const copy = el('div');

    copy.append(
      el('h3', 'text-lg font-bold text-stone-900', p.title || 'Untitled product')
    );

    copy.append(
      el(
        'p',
        'mt-1 text-sm capitalize text-stone-500',
        `${p.brand || 'Brand not listed'} · ${(p.category || 'Uncategorised').replaceAll('-', ' ')}`
      )
    );

    copy.append(
      el(
        'p',
        'mt-4 text-sm leading-6 text-stone-700',
        p.description || 'No description available.'
      )
    );

    copy.append(
      el('p', 'mt-4 text-2xl font-bold text-[#172d27]', formatPrice(p.price))
    );

    const facts = el(
      'dl',
      'mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2'
    );

    const rows = [
      ['Rating', Number.isFinite(p.rating) ? `${p.rating.toFixed(1)} / 5` : 'Not rated'],
      ['Stock', String(p.stock ?? 'Not provided')],
      ['Warranty', p.warrantyInformation || 'Not provided'],
      ['Shipping', p.shippingInformation || 'Not provided'],
      ['Returns', p.returnPolicy || 'Not provided'],
    ];

    rows.forEach(([label, value]) => {
      const item = el('div', 'rounded-lg bg-stone-50 p-3');

      item.append(
        el('dt', 'text-xs font-semibold uppercase tracking-wide text-stone-400', label)
      );

      item.append(
        el('dd', 'mt-1 text-stone-700', value)
      );

      facts.append(item);
    });

    copy.append(facts);
    body.append(image, copy);
    panel.append(body);
  }

  return panel;
}

/**
 * Render the complete page from state.
 */
export function render(state) {
  const visibleItems = getVisibleItems(state);

  state.visibleCount = visibleItems.length;

  const page = el('div', 'min-h-screen');

  page.append(makeHeader());

  const main = el(
    'main',
    'mx-auto max-w-7xl space-y-7 px-5 py-8 sm:px-8 sm:py-10'
  );

  const intro = el('section', 'max-w-3xl');

  intro.append(
    el(
      'p',
      'text-xs font-bold uppercase tracking-[0.22em] text-emerald-800',
      'Your everyday discovery shop'
    )
  );

  intro.append(
    el(
      'h1',
      'mt-3 text-3xl font-bold tracking-tight text-[#172d27] sm:text-4xl',
      'Explore the catalogue'
    )
  );

  intro.append(
    el(
      'p',
      'mt-3 text-base leading-7 text-stone-600',
      'Search, compare and explore product information from a public API. Use the controls to find what you need.'
    )
  );

  main.append(intro, renderStatus(state));

  if (state.status === 'loading') {
    main.append(renderSkeletons());
  } else if (state.status === 'error') {
    main.append(renderError(state));
  } else {
    main.append(renderStats(state, visibleItems));

    const {
      controls,
      search,
      categorySelect,
      sortSelect,
    } = makeControls(state);

    main.append(controls);

    const headingRow = el(
      'div',
      'flex flex-wrap items-center justify-between gap-2'
    );

    headingRow.append(
      el('h2', 'text-xl font-bold text-stone-900', 'All products')
    );

    headingRow.append(
      el(
        'p',
        'text-sm text-stone-500',
        `${visibleItems.length} result${visibleItems.length === 1 ? '' : 's'}`
      )
    );

    main.append(headingRow);

    if (visibleItems.length === 0) {
      main.append(renderEmpty());
    } else {
      const grid = el(
        'div',
        'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      );

      // map() creates each product card.
      visibleItems
        .map((product) => makeProductCard(product))
        .forEach((card) => grid.append(card));

      main.append(grid);
    }

    const details = renderDetails(state);

    if (details) main.append(details);

    // Search input event.
    search.addEventListener('input', (event) => {
      state.onSearch(event.currentTarget.value);
    });

    // Category filtering event.
    categorySelect.addEventListener('change', (event) => {
      state.filter = event.currentTarget.value;
      state.onChange();
    });

    // Sorting event.
    sortSelect.addEventListener('change', (event) => {
      state.sort = event.currentTarget.value;
      state.onChange();
    });

    // Product details event.
    page.querySelectorAll('[data-product-id]').forEach((button) => {
      button.addEventListener('click', () => {
        state.onOpenDetails(button.dataset.productId);
      });
    });
  }

  const footer = el('footer', 'border-t border-stone-200 bg-white');

  const footerInner = el(
    'div',
    'mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-8'
  );

  footerInner.append(
    el('p', '', 'Goods & Co. · Week 5 Async Data Fetching Practice')
  );

  footerInner.append(
    el('p', '', 'Built with Vite, Tailwind CSS v4 and vanilla JavaScript.')
  );

  footer.append(footerInner);
  page.append(main, footer);

  // Preserve search focus and cursor position when re-rendering.
  const active = document.activeElement;
  const focusedId = active?.id;

  const selectionStart =
    active instanceof HTMLInputElement
      ? active.selectionStart
      : null;

  const selectionEnd =
    active instanceof HTMLInputElement
      ? active.selectionEnd
      : null;

  app.replaceChildren(page);

  app.querySelector('#retry-button')?.addEventListener(
    'click',
    state.onRetry
  );

  app.querySelector('#close-details')?.addEventListener(
    'click',
    state.onCloseDetails
  );

  if (focusedId) {
    const replacement = app.querySelector(`#${focusedId}`);

    if (replacement instanceof HTMLElement) {
      replacement.focus({ preventScroll: true });

      if (
        replacement instanceof HTMLInputElement &&
        selectionStart !== null &&
        selectionEnd !== null
      ) {
        replacement.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }
}