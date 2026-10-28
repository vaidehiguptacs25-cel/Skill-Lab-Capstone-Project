/* main.js - shared helpers: navbar/footer, toast, validation, route protection, add-to-cart. */
const ROOT = document.body.dataset.root || "";                          // "" on index.html, "../" inside pages/
const $ = (sel, parent = document) => parent.querySelector(sel);       // short query helper
const formatPrice = (n) => "₹" + Number(n).toLocaleString("en-IN");    // money formatting
const unitPrice = (p) => p.discountPrice || p.price;                   // price actually charged

function esc(text) {                                                    // escape user text before using innerHTML
  const d = document.createElement("div"); d.textContent = String(text ?? ""); return d.innerHTML.replace(/"/g, "&quot;");
}
function showToast(message, type = "success") {                         // show a temporary message
  let box = $("#toasts"); if (!box) { box = document.createElement("div"); box.id = "toasts"; box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
  const t = document.createElement("div"); t.className = "toast toast-" + type; t.textContent = message; box.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
function productCard(p) {                                               // HTML for one product card (shared)
  const price = p.discountPrice ? `<span class="price">${formatPrice(p.discountPrice)}</span> <s>${formatPrice(p.price)}</s>` : `<span class="price">${formatPrice(p.price)}</span>`;
  return `<article class="card"><a href="${ROOT}pages/product-detail.html?id=${esc(p.id)}"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></a>
    <div class="card-body"><h3>${esc(p.name)}</h3><p>★ ${Number(p.rating).toFixed(1)} (${p.reviewsCount})</p><p>${price}</p>
    <button class="btn btn-primary" data-add="${esc(p.id)}" ${p.stock < 1 ? "disabled" : ""}>${p.stock < 1 ? "Out of stock" : "Add to Cart"}</button></div></article>`;
}
document.addEventListener("error", (e) => {                             // fallback for broken images
  if (e.target.tagName === "IMG" && !e.target.dataset.failed) { e.target.dataset.failed = "1"; e.target.src = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#e5e7eb" width="400" height="300"/><text x="200" y="155" text-anchor="middle" fill="#6b7280" font-size="20">No image</text></svg>'); }
}, true);

async function updateCartBadge() {                                      // refresh the cart count in navbar
  const res = await getCart(); const badge = $("#cartCount"); if (badge) badge.textContent = res.success ? res.data.reduce((s, i) => s + i.qty, 0) : 0;
}
async function renderLayout() {                                         // build navbar + footer
  const res = await getCurrentUser(); const user = res.success ? res.data : null;
  const page = location.pathname.split("/").pop() || "index.html";
  const link = (href, label) => `<a href="${ROOT + href}" class="${page === href.split("/").pop() ? "active" : ""}">${label}</a>`;
  const account = user
    ? `${link("pages/profile.html", "Profile")}${link("pages/orders.html", "My Orders")}${user.role === "admin" ? link("pages/admin-dashboard.html", "Dashboard") : ""}<button class="btn btn-secondary" id="logoutBtn">Logout (${esc(user.name.split(" ")[0])})</button>`
    : `${link("pages/login.html", "Login")}${link("pages/register.html", "Register")}`;
  $("#site-header").innerHTML = `<header class="site-header"><div class="container nav-wrap"><a class="logo" href="${ROOT}index.html">ShopEasy</a>
    <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">☰</button>
    <nav class="nav" aria-label="Main">${link("index.html", "Home")}${link("pages/products.html", "Products")}
    <form id="navSearch" role="search"><input type="search" aria-label="Search products" placeholder="Search products"></form>
    <a href="${ROOT}pages/cart.html" aria-label="Cart">🛒 <span class="badge-count" id="cartCount">0</span></a>${account}</nav></div></header>`;
  $("#site-footer").innerHTML = `<footer class="site-footer"><p>© 2026 ShopEasy - Student capstone project</p></footer>`;
  const nav = $("#site-header .nav"), burger = $(".hamburger");
  burger.addEventListener("click", () => { const open = nav.classList.toggle("open"); burger.setAttribute("aria-expanded", open); });
  $("#navSearch").addEventListener("submit", (e) => { e.preventDefault(); location.href = ROOT + "pages/products.html?search=" + encodeURIComponent($("#navSearch input").value.trim()); });
  const out = $("#logoutBtn"); if (out) out.addEventListener("click", async () => { await logoutUser(); location.href = ROOT + "index.html"; });
  updateCartBadge();
}
// Delegated Add to Cart (cards on every page)
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-add]"); if (!btn || btn.disabled) return;
  btn.disabled = true;
  try { const r = await addToCart(btn.dataset.add, 1); showToast(r.success ? "Added to cart!" : r.message, r.success ? "success" : "error"); updateCartBadge(); }
  catch (err) { showToast("Could not add to cart.", "error"); }
  btn.disabled = false;
});

// ---------- Route protection ----------
async function requireLogin() {                                         // redirect to login if not logged in
  const r = await getCurrentUser();
  if (!r.success) { location.href = ROOT + "pages/login.html?redirect=" + encodeURIComponent(location.pathname.split("/").pop() + location.search); return null; }
  return r.data;
}
async function requireRole(role) {                                      // redirect if user lacks the role
  const user = await requireLogin(); if (!user) return null;
  if (user.role !== role) { alert("You do not have permission to view that page."); location.href = ROOT + "index.html"; return null; }
  return user;
}

// ---------- Validation (rules are named in data-rules="required email") ----------
const RULES = {
  required: (v) => (v.trim() ? "" : "This field is required."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email like name@example.com."),
  phone: (v) => (/^\d{10}$/.test(v) ? "" : "Phone must be exactly 10 digits."),
  pincode: (v) => (/^\d{6}$/.test(v) ? "" : "Pincode must be exactly 6 digits."),
  password: (v) => (/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v) ? "" : "Password needs 8+ characters with at least one letter and one number."),
  price: (v) => (Number(v) > 0 ? "" : "Price must be greater than 0."),
  stock: (v) => (/^\d+$/.test(v) ? "" : "Stock must be a whole number, 0 or more.")
};
function validateField(el) {                                            // validate one input, show message
  let msg = "";
  for (const rule of (el.dataset.rules || "").split(" ").filter(Boolean)) {
    if (rule !== "required" && !el.value.trim()) continue;              // empty optional fields are fine
    if (rule.startsWith("match:")) { if (el.value !== document.getElementById(rule.slice(6)).value) msg = "Passwords do not match."; }
    else if (RULES[rule]) msg = RULES[rule](el.value);
    if (msg) break;
  }
  const box = el.closest(".field"); box.querySelector(".error").textContent = msg;
  box.classList.toggle("invalid", !!msg); box.classList.toggle("valid", !msg && !!el.value.trim()); return !msg;
}
function setupForm(form, onValid) {                                     // validate on blur + submit, block double submit
  const fields = [...form.querySelectorAll("[data-rules]")];
  fields.forEach((f) => f.addEventListener("blur", () => validateField(f)));
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); const btn = form.querySelector("[type=submit]"); if (btn.disabled) return;
    let good = true; fields.forEach((f) => { if (!validateField(f)) good = false; });
    if (!good) { showToast("Please fix the highlighted fields.", "error"); return; }
    btn.disabled = true;
    try { await onValid(Object.fromEntries(new FormData(form))); } catch (err) { showToast("Something went wrong. Please try again.", "error"); }
    btn.disabled = false;
  });
}
document.addEventListener("DOMContentLoaded", renderLayout);
