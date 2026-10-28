/* api.js - ALL data access. Every function is async and returns { success, data } or { success:false, message }.
   Part 3: set USE_MOCK=false and replace the bodies with fetch(BASE_URL + ...). */
const USE_MOCK = true;
const BASE_URL = "http://localhost:5000/api";
const KEYS = { users: "ec_users", products: "ec_products", orders: "ec_orders", cart: "ec_cart", session: "ec_session" };
const PAGE_SIZE = 8;

const wait = () => new Promise((r) => setTimeout(r, 300));              // fake network delay
const ok = (data) => ({ success: true, data });                          // success response
const fail = (message) => ({ success: false, message });                 // error response
function load(key, fallback) {                                           // read localStorage safely (resets if corrupted)
  try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; }
  catch (e) { localStorage.removeItem(key); return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function seedOnce() {                                                    // seed mock data on first load only
  if (localStorage.getItem("ec_seeded")) return;
  save(KEYS.users, MOCK_USERS); save(KEYS.products, MOCK_PRODUCTS); save(KEYS.orders, MOCK_ORDERS); save(KEYS.cart, []);
  localStorage.setItem("ec_seeded", "1");
}
seedOnce();
const list = (key) => { const v = load(key, []); return Array.isArray(v) ? v : []; };
const safeUser = (u) => { const { password, ...rest } = u; return rest; };  // never expose password
const sessionUser = () => { const s = load(KEYS.session, null); return s && s.user ? s.user : null; };
const unit = (p) => p.discountPrice || p.price;

// ---------- Auth ----------
// Future: POST /api/auth/register
async function registerUser(data) {
  await wait(); const users = list(KEYS.users);
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) return fail("This email is already registered.");
  const user = { id: "u" + Date.now(), name: data.name, email: data.email, password: data.password, role: data.role === "admin" ? "admin" : "customer", phone: data.phone, address: "" };
  users.push(user); save(KEYS.users, users); return ok(safeUser(user));
}
// Future: POST /api/auth/login
async function loginUser(email, password) {
  await wait(); const u = list(KEYS.users).find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (!u) return fail("Incorrect email or password.");
  save(KEYS.session, { token: "mock-token-" + u.id, user: safeUser(u) }); return ok(safeUser(u));
}
// Future: POST /api/auth/logout
async function logoutUser() { await wait(); localStorage.removeItem(KEYS.session); return ok(null); }
// Future: GET /api/auth/me
async function getCurrentUser() { const u = sessionUser(); return u ? ok(u) : fail("Not logged in."); }

// ---------- Products ----------
// Future: GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=
async function getProducts({ search = "", category = "", minPrice, maxPrice, sort = "", page = 1 } = {}) {
  await wait(); let items = list(KEYS.products); const s = search.trim().toLowerCase();
  if (s) items = items.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  if (category) items = items.filter((p) => p.category === category);
  if (minPrice) items = items.filter((p) => unit(p) >= Number(minPrice));
  if (maxPrice) items = items.filter((p) => unit(p) <= Number(maxPrice));
  const sorters = { "price-asc": (a, b) => unit(a) - unit(b), "price-desc": (a, b) => unit(b) - unit(a), rating: (a, b) => b.rating - a.rating, newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) };
  if (sorters[sort]) items.sort(sorters[sort]);
  const total = items.length, pages = Math.max(1, Math.ceil(total / PAGE_SIZE)), pg = Math.min(Math.max(1, Number(page) || 1), pages);
  return ok({ items: items.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE), total, page: pg, pages });
}
// Future: GET /api/products/:id
async function getProductById(id) { await wait(); const p = list(KEYS.products).find((x) => x.id === id); return p ? ok(p) : fail("Product not found."); }
// Future: POST /api/products (admin)
async function createProduct(data) {
  await wait(); const u = sessionUser(); if (!u || u.role !== "admin") return fail("Not allowed.");
  const products = list(KEYS.products); const p = { ...data, id: "p" + Date.now(), rating: 0, reviewsCount: 0, sellerId: u.id, createdAt: new Date().toISOString() };
  products.push(p); save(KEYS.products, products); return ok(p);
}
// Future: PUT /api/products/:id (admin)
async function updateProduct(id, data) {
  await wait(); const u = sessionUser(); if (!u || u.role !== "admin") return fail("Not allowed.");
  const products = list(KEYS.products); const i = products.findIndex((p) => p.id === id); if (i < 0) return fail("Product not found.");
  products[i] = { ...products[i], ...data, id }; save(KEYS.products, products); return ok(products[i]);
}
// Future: DELETE /api/products/:id (admin)
async function deleteProduct(id) {
  await wait(); const u = sessionUser(); if (!u || u.role !== "admin") return fail("Not allowed.");
  save(KEYS.products, list(KEYS.products).filter((p) => p.id !== id)); return ok(null);
}
// Future: GET /api/categories
async function getCategories() { await wait(); return ok(MOCK_CATEGORIES); }

// ---------- Cart ----------
// Future: GET /api/cart
async function getCart() {
  const products = list(KEYS.products);
  const items = list(KEYS.cart).map((c) => ({ product: products.find((p) => p.id === c.productId), qty: c.qty })).filter((c) => c.product);
  return ok(items);
}
// Future: POST /api/cart
async function addToCart(productId, qty = 1) {
  await wait(); const p = list(KEYS.products).find((x) => x.id === productId);
  if (!p) return fail("Product not found."); if (p.stock < 1) return fail("This product is out of stock.");
  const cart = list(KEYS.cart); const line = cart.find((c) => c.productId === productId);
  const newQty = (line ? line.qty : 0) + qty;
  if (newQty > p.stock) return fail("Only " + p.stock + " in stock.");
  if (line) line.qty = newQty; else cart.push({ productId, qty }); save(KEYS.cart, cart); return ok(cart);
}
// Future: PUT /api/cart/:productId
async function updateCartItem(productId, qty) {
  await wait(); const p = list(KEYS.products).find((x) => x.id === productId); const cart = list(KEYS.cart); const line = cart.find((c) => c.productId === productId);
  if (!p || !line) return fail("Item not in cart."); if (qty < 1) return fail("Quantity must be at least 1."); if (qty > p.stock) return fail("Only " + p.stock + " in stock.");
  line.qty = qty; save(KEYS.cart, cart); return ok(cart);
}
// Future: DELETE /api/cart/:productId
async function removeFromCart(productId) { await wait(); save(KEYS.cart, list(KEYS.cart).filter((c) => c.productId !== productId)); return ok(null); }
// Future: DELETE /api/cart
async function clearCart() { await wait(); save(KEYS.cart, []); return ok(null); }

// ---------- Orders ----------
// Future: POST /api/orders
async function placeOrder(orderData) {
  await wait(); const u = sessionUser(); if (!u) return fail("Please log in.");
  const cart = (await getCart()).data; if (!cart.length) return fail("Your cart is empty.");
  const products = list(KEYS.products);
  for (const c of cart) if (c.qty > c.product.stock) return fail(c.product.name + " has only " + c.product.stock + " left.");
  const order = { id: "ORD" + Date.now(), userId: u.id, status: "Pending", date: new Date().toISOString(), total: orderData.total, shippingAddress: orderData.shippingAddress, paymentMethod: orderData.paymentMethod,
    items: cart.map((c) => ({ productId: c.product.id, name: c.product.name, price: unit(c.product), qty: c.qty })) };
  cart.forEach((c) => { products.find((p) => p.id === c.product.id).stock -= c.qty; });
  const orders = list(KEYS.orders); orders.push(order); save(KEYS.orders, orders); save(KEYS.products, products); save(KEYS.cart, []); return ok(order);
}
// Future: GET /api/orders/my
async function getMyOrders() { await wait(); const u = sessionUser(); if (!u) return fail("Please log in."); return ok(list(KEYS.orders).filter((o) => o.userId === u.id).reverse()); }
// Future: GET /api/orders (admin)
async function getAllOrders() { await wait(); const u = sessionUser(); if (!u || u.role !== "admin") return fail("Not allowed."); return ok(list(KEYS.orders).reverse()); }
// Future: PUT /api/orders/:id/status (admin)
async function updateOrderStatus(id, status) {
  await wait(); const u = sessionUser(); if (!u || u.role !== "admin") return fail("Not allowed.");
  const orders = list(KEYS.orders); const o = orders.find((x) => x.id === id); if (!o) return fail("Order not found.");
  o.status = status; save(KEYS.orders, orders); return ok(o);
}

// ---------- Profile ----------
// Future: PUT /api/users/me
async function updateProfile(data) {
  await wait(); const cur = sessionUser(); if (!cur) return fail("Please log in.");
  const users = list(KEYS.users); const i = users.findIndex((x) => x.id === cur.id); if (i < 0) return fail("User not found.");
  users[i] = { ...users[i], name: data.name, phone: data.phone, address: data.address }; save(KEYS.users, users);
  const s = load(KEYS.session, {}); s.user = safeUser(users[i]); save(KEYS.session, s); return ok(s.user);
}
