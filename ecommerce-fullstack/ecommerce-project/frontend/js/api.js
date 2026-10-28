/* api.js - ALL data access. Talks to the Express REST API at BASE_URL.
   Every function is async and returns { success, data } or { success:false, message }.
   (The old localStorage version is kept as api.mock.js for offline demos.) */
const BASE_URL = "http://localhost:5000/api";
const SESSION_KEY = "ec_session";                                         // { token, user }

const fail = (message) => ({ success: false, message });                  // error response
const ok = (data) => ({ success: true, data });                           // success response
function getSession() {                                                   // read session safely (resets if corrupted)
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; } catch (e) { localStorage.removeItem(SESSION_KEY); return null; }
}
async function request(method, path, body) {                              // one place for every fetch call
  const session = getSession(), headers = { "Content-Type": "application/json" };
  if (session && session.token) headers.Authorization = "Bearer " + session.token;
  try {
    const res = await fetch(BASE_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json().catch(() => null);
    if (res.status === 401 && session) localStorage.removeItem(SESSION_KEY);   // token expired or invalid
    return json || fail("Unexpected server response.");
  } catch (e) { return fail("Cannot reach the server. Is the backend running on port 5000?"); }
}
const loggedIn = () => !!(getSession() && getSession().token);

// ---------- Auth ----------
// Future: POST /api/auth/register
async function registerUser(data) { return request("POST", "/auth/register", data); }
// Future: POST /api/auth/login
async function loginUser(email, password) {
  const r = await request("POST", "/auth/login", { email, password });
  if (!r.success) return r;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token: r.data.token, user: r.data.user })); return ok(r.data.user);
}
// Future: client-side only (JWT is stateless)
async function logoutUser() { localStorage.removeItem(SESSION_KEY); return ok(null); }
// Future: GET /api/auth/me
async function getCurrentUser() {
  if (!loggedIn()) return fail("Not logged in.");
  const r = await request("GET", "/auth/me");
  if (r.success) localStorage.setItem(SESSION_KEY, JSON.stringify({ token: getSession().token, user: r.data }));
  return r;
}

// ---------- Products ----------
// Future: GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=
async function getProducts(filters = {}) {
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== undefined && v !== "" && v !== null)).toString();
  return request("GET", "/products" + (qs ? "?" + qs : ""));
}
// Future: GET /api/products/:id
async function getProductById(id) { return request("GET", "/products/" + encodeURIComponent(id)); }
// Future: POST /api/products (admin)
async function createProduct(data) { return request("POST", "/products", data); }
// Future: PUT /api/products/:id (admin)
async function updateProduct(id, data) { return request("PUT", "/products/" + encodeURIComponent(id), data); }
// Future: DELETE /api/products/:id (admin)
async function deleteProduct(id) { return request("DELETE", "/products/" + encodeURIComponent(id)); }
// Future: GET /api/categories
async function getCategories() { return request("GET", "/categories"); }

// ---------- Cart (server-side, login required) ----------
// Future: GET /api/cart
async function getCart() { return loggedIn() ? request("GET", "/cart") : ok([]); }
// Future: POST /api/cart
async function addToCart(productId, qty = 1) { return loggedIn() ? request("POST", "/cart", { productId, qty }) : fail("Please log in to add items to your cart."); }
// Future: PUT /api/cart/:productId
async function updateCartItem(productId, qty) { return request("PUT", "/cart/" + encodeURIComponent(productId), { qty }); }
// Future: DELETE /api/cart/:productId
async function removeFromCart(productId) { return request("DELETE", "/cart/" + encodeURIComponent(productId)); }
// Future: DELETE /api/cart
async function clearCart() { return request("DELETE", "/cart"); }

// ---------- Orders ----------
// Future: POST /api/orders (server recalculates the total)
async function placeOrder(orderData) { return request("POST", "/orders", orderData); }
// Future: GET /api/orders/my
async function getMyOrders() { return request("GET", "/orders/my"); }
// Future: GET /api/orders (admin)
async function getAllOrders() { return request("GET", "/orders"); }
// Future: PUT /api/orders/:id/status (admin)
async function updateOrderStatus(id, status) { return request("PUT", "/orders/" + encodeURIComponent(id) + "/status", { status }); }

// ---------- Profile ----------
// Future: PUT /api/users/me
async function updateProfile(data) { return request("PUT", "/users/me", data); }
