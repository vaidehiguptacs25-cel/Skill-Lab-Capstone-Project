/* orders.js - order history and profile pages. */
document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireLogin(); if (!user) return;
  if ($("#ordersList")) {
    const r = await getMyOrders(), box = $("#ordersList");
    if (!r.success || !r.data.length) { box.innerHTML = '<p class="empty">You have no orders yet. <a href="products.html">Start shopping</a></p>'; return; }
    box.innerHTML = r.data.map((o) => `<details class="panel"><summary><strong>${esc(o.id)}</strong> - ${new Date(o.date).toLocaleDateString()} - ${formatPrice(o.total)} <span class="badge badge-${esc(o.status.toLowerCase())}">${esc(o.status)}</span></summary>
      <ul>${o.items.map((i) => `<li>${esc(i.name)} x ${i.qty} - ${formatPrice(i.price * i.qty)}</li>`).join("")}</ul><p>Ship to: ${esc(o.shippingAddress.address)}, ${esc(o.shippingAddress.city)} - ${esc(o.shippingAddress.pincode)}</p></details>`).join("");
  }
  if ($("#profileForm")) {
    const f = $("#profileForm"); f.elements.name.value = user.name; f.elements.email.value = user.email; f.elements.phone.value = user.phone || ""; f.elements.address.value = user.address || "";
    setupForm(f, async (d) => { const r = await updateProfile({ name: d.name, phone: d.phone, address: d.address }); showToast(r.success ? "Profile updated!" : r.message, r.success ? "success" : "error"); if (r.success) renderLayout(); });
  }
});
