// 1. Product Data (8 items matching the reference layout)
const products = [
  { id: 1, name: "Wireless Headphones", price: 1290000, category: "Electronics", image: "🎧" },
  { id: 2, name: "Smart Watch", price: 2490000, category: "Electronics", image: "⌚" },
  { id: 3, name: "Bluetooth Speaker", price: 890000, category: "Electronics", image: "🔊" },
  { id: 4, name: "Denim Jacket", price: 750000, category: "Fashion", image: "🧥" },
  { id: 5, name: "Running Shoes", price: 1150000, category: "Fashion", image: "👟" },
  { id: 6, name: "Baseball Cap", price: 190000, category: "Fashion", image: "🧢" },
  { id: 7, name: "JavaScript Handbook", price: 320000, category: "Books", image: "📘" },
  { id: 8, name: "Web Design Sketchbook", price: 150000, category: "Books", image: "📓" }
];

const CART_STORAGE_KEY = "mini_shop_cart";

// Application State
let cart = []; // Array of { id, quantity }
let activeCategory = "All";
let searchQuery = "";

// DOM Elements
const productGrid = document.getElementById("product-grid");
const categoryFilters = document.getElementById("category-filters");
const searchInput = document.getElementById("search-input");
const cartBadge = document.getElementById("cart-badge");
const cartTotalPrice = document.getElementById("cart-total-price");
const clearCartBtn = document.getElementById("clear-cart-btn");

// Format currency in Vietnamese Dong
function formatVND(amount) {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND"
  });
}

// 5. Load & Save Cart from/to localStorage
function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    cart = saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Failed to parse cart from localStorage:", err);
    cart = [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// 2. Render Category Filter Buttons dynamically
function renderCategoryButtons() {
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  categoryFilters.innerHTML = categories
    .map(
      (cat) => `
      <button 
        type="button" 
        class="filter-btn ${cat === activeCategory ? "active" : ""}" 
        data-category="${cat}">
        ${cat}
      </button>
    `
    )
    .join("");
}

// 1. Render Product Cards dynamically (applying category + search filters)
function renderProducts() {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = `<p class="empty-state">No products match your search or filter.</p>`;
    return;
  }

  productGrid.innerHTML = filteredProducts
    .map((product) => {
      const cartItem = cart.find((item) => item.id === product.id);
      const qtyInCart = cartItem ? cartItem.quantity : 0;
      const buttonLabel =
        qtyInCart > 0 ? `Add to cart (${qtyInCart} in cart)` : "Add to cart";

      return `
        <article class="product-card" data-id="${product.id}">
          <div class="product-image">${product.image}</div>
          <span class="product-category">${product.category}</span>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">${formatVND(product.price)}</p>
          <button type="button" class="add-to-cart-btn">${buttonLabel}</button>
        </article>
      `;
    })
    .join("");
}

// 4 & Bonus. Update Cart Badge & Total Price UI
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  cartBadge.textContent = totalItems;
  cartTotalPrice.textContent = formatVND(totalPrice);
}

// Add item to cart (increments quantity if already present)
function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  renderProducts(); // Refresh button text ("X in cart")
}

// --- Event Listeners ---

// 3. Single click listener on product grid using event delegation
productGrid.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-to-cart-btn");
  if (!addBtn) return;

  const card = e.target.closest(".product-card");
  if (!card) return;

  const productId = Number(card.dataset.id);
  addToCart(productId);
});

// Category filter clicks (event delegation)
categoryFilters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;

  activeCategory = btn.dataset.category;
  renderCategoryButtons();
  renderProducts();
});

// Bonus: Live search filter on every keystroke
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderProducts();
});

// 6. Clear cart button
clearCartBtn.addEventListener("click", () => {
  cart = [];
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartUI();
  renderProducts();
});

// Initialize Application
function init() {
  loadCart();
  renderCategoryButtons();
  renderProducts();
  updateCartUI();
}

init();