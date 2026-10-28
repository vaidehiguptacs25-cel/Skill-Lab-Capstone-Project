/* admin.js - seller/admin dashboard: stats, product CRUD, order status. */
document.addEventListener("DOMContentLoaded", async () => {
  if (!(await requireRole("admin"))) return;
  const modal = $("#productModal"), form = $("#productForm"); let products = [];
  const cats = await getCategories(); $("#pCategory").innerHTML = cats.data.map((c) => `<option>${esc(c)}</option>`).join("");

  async function refresh() {                                            // reload stats + both tables
    try {
      const first = (await getProducts({ page: 1 })).data; const all = [...first.items];
      for (let p = 2; p <= first.pages; p++) all.push(...(await getProducts({ page: p })).data.items);
      products = all; const orders = (await getAllOrders()).data;
      const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
      $("#stats").innerHTML = [["Products", products.length], ["Orders", orders.length], ["Revenue", formatPrice(revenue)], ["Low stock (<5)", products.filter((p) => p.stock < 5).length]].map((s) => `<div class="stat"><span>${s[0]}</span><strong>${s[1]}</strong></div>`).join("");
      $("#productRows").innerHTML = products.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${formatPrice(unitPrice(p))}</td><td>${p.stock}</td>
        <td><button class="btn btn-secondary" data-edit="${esc(p.id)}">Edit</button> <button class="btn btn-danger" data-del="${esc(p.id)}">Delete</button></td></tr>`).join("");
      $("#orderRows").innerHTML = orders.map((o) => `<tr><td>${esc(o.id)}</td><td>${formatPrice(o.total)}</td><td><label class="sr-only" for="s${esc(o.id)}">Status</label><select id="s${esc(o.id)}" data-status="${esc(o.id)}">${["Pending", "Shipped", "Delivered", "Cancelled"].map((s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select></td></tr>`).join("");
    } catch (e) { showToast("Could not load dashboard data.", "error"); }
  }
  function openModal(p) {                                               // open form for add (null) or edit
    form.reset(); form.querySelectorAll(".field").forEach((f) => f.classList.remove("valid", "invalid")); form.querySelectorAll(".error").forEach((e) => { e.textContent = ""; });
    form.elements.id.value = p ? p.id : ""; $("#modalTitle").textContent = p ? "Edit Product" : "Add Product";
    if (p) { form.elements.name.value = p.name; form.elements.price.value = p.price; form.elements.discountPrice.value = p.discountPrice || ""; form.elements.category.value = p.category; form.elements.stock.value = p.stock; form.elements.image.value = p.image; form.elements.description.value = p.description; }
    modal.hidden = false; form.elements.name.focus();
  }
  $("#addBtn").addEventListener("click", () => openModal(null));
  $("#cancelBtn").addEventListener("click", () => { modal.hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.hidden = true; });
  setupForm(form, async (d) => {
    const data = { name: d.name, price: Number(d.price), discountPrice: d.discountPrice ? Number(d.discountPrice) : null, category: d.category, stock: Number(d.stock), image: d.image || "https://picsum.photos/seed/new" + Date.now() + "/400/300", description: d.description };
    if (data.discountPrice && data.discountPrice >= data.price) { showToast("Discount price must be lower than price.", "error"); return; }
    const r = d.id ? await updateProduct(d.id, data) : await createProduct(data);
    if (!r.success) { showToast(r.message, "error"); return; }
    showToast(d.id ? "Product updated." : "Product added."); modal.hidden = true; refresh();
  });
  document.addEventListener("click", async (e) => {
    const ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-del]");
    if (ed) openModal(products.find((p) => p.id === ed.dataset.edit));
    if (del && confirm("Delete this product? This cannot be undone.")) { const r = await deleteProduct(del.dataset.del); showToast(r.success ? "Product deleted." : r.message, r.success ? "success" : "error"); refresh(); }
  });
  document.addEventListener("change", async (e) => { const s = e.target.closest("[data-status]"); if (s) { const r = await updateOrderStatus(s.dataset.status, s.value); showToast(r.success ? "Status updated." : r.message, r.success ? "success" : "error"); } });
  refresh();
});
