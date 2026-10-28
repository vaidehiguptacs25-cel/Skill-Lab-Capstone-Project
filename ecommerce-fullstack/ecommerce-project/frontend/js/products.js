/* products.js - home sections, products listing (search/filter/sort/pagination) and product detail. */
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);

  // ----- Home -----
  if ($("#featured")) {
    try {
      const [f, n, c] = await Promise.all([getProducts({ sort: "rating" }), getProducts({ sort: "newest" }), getCategories()]);
      $("#featured").innerHTML = f.data.items.slice(0, 4).map(productCard).join("");
      $("#arrivals").innerHTML = n.data.items.slice(0, 4).map(productCard).join("");
      $("#categoryCards").innerHTML = c.data.map((x) => `<a class="cat-card" href="${ROOT}pages/products.html?category=${encodeURIComponent(x)}">${esc(x)}</a>`).join("");
    } catch (e) { showToast("Could not load products.", "error"); }
  }

  // ----- Listing -----
  if ($("#productGrid")) {
    const form = $("#filters"), grid = $("#productGrid");
    const cats = await getCategories();
    $("#category").innerHTML = '<option value="">All categories</option>' + cats.data.map((c) => `<option>${esc(c)}</option>`).join("");
    ["search", "category", "minPrice", "maxPrice", "sort"].forEach((k) => { if (params.get(k)) form.elements[k].value = params.get(k); });
    let page = Number(params.get("page")) || 1, timer;

    async function loadProducts() {                                     // fetch + render using current filters
      const q = { page }; ["search", "category", "minPrice", "maxPrice", "sort"].forEach((k) => { q[k] = form.elements[k].value; });
      history.replaceState(null, "", "?" + new URLSearchParams(Object.fromEntries(Object.entries(q).filter(([, v]) => v && v !== "")))); // keep filters in URL
      grid.innerHTML = '<p class="empty">Loading products...</p>';
      try {
        const r = await getProducts(q); const d = r.data; page = d.page;
        grid.innerHTML = d.items.length ? d.items.map(productCard).join("") : '<p class="empty">No products found. Try clearing filters.</p>';
        $("#pager").innerHTML = Array.from({ length: d.pages }, (_, i) => `<button class="btn ${i + 1 === d.page ? "btn-primary" : "btn-secondary"}" data-page="${i + 1}" aria-label="Page ${i + 1}">${i + 1}</button>`).join("");
      } catch (e) { grid.innerHTML = '<p class="empty">Could not load products.</p>'; showToast("Could not load products.", "error"); }
    }
    form.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => { page = 1; loadProducts(); }, 400); });  // debounce
    form.addEventListener("submit", (e) => e.preventDefault());
    $("#clearBtn").addEventListener("click", () => { form.reset(); page = 1; loadProducts(); });
    $("#pager").addEventListener("click", (e) => { const b = e.target.closest("[data-page]"); if (b) { page = Number(b.dataset.page); loadProducts(); window.scrollTo(0, 0); } });
    loadProducts();
  }

  // ----- Detail -----
  if ($("#detail")) {
    const box = $("#detail"); const r = await getProductById(params.get("id") || "");
    if (!r.success) { box.innerHTML = '<p class="empty">Sorry, we could not find that product. <a href="products.html">Browse products</a></p>'; return; }
    const p = r.data, out = p.stock < 1;
    box.innerHTML = `<img src="${esc(p.image)}" alt="${esc(p.name)}"><div><h1>${esc(p.name)}</h1><p>★ ${Number(p.rating).toFixed(1)} (${p.reviewsCount} reviews)</p>
      <p class="price">${formatPrice(unitPrice(p))} ${p.discountPrice ? `<s>${formatPrice(p.price)}</s>` : ""}</p>
      <p>${out ? '<span class="badge badge-cancelled">Out of stock</span>' : `<span class="badge badge-delivered">In stock (${p.stock})</span>`}</p><p>${esc(p.description)}</p>
      <div class="field"><label for="qty">Quantity</label><input id="qty" type="number" min="1" max="${p.stock}" value="1" ${out ? "disabled" : ""}></div>
      <button class="btn btn-primary" id="addBtn" ${out ? "disabled" : ""}>Add to Cart</button> <button class="btn btn-secondary" id="buyBtn" ${out ? "disabled" : ""}>Buy Now</button></div>`;
    async function add() {                                              // add chosen quantity (validates range)
      const qty = Number($("#qty").value);
      if (!Number.isInteger(qty) || qty < 1 || qty > p.stock) { showToast("Quantity must be between 1 and " + p.stock + ".", "error"); return false; }
      const a = await addToCart(p.id, qty); showToast(a.success ? "Added to cart!" : a.message, a.success ? "success" : "error"); updateCartBadge(); return a.success;
    }
    if (!out) {
      $("#addBtn").addEventListener("click", add);
      $("#buyBtn").addEventListener("click", async () => { if (await add()) location.href = "cart.html"; });
    }
    const rel = await getProducts({ category: p.category });
    $("#related").innerHTML = rel.data.items.filter((x) => x.id !== p.id).slice(0, 4).map(productCard).join("");
  }
});
