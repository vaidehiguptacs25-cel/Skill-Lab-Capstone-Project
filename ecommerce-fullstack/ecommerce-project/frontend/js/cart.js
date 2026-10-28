/* cart.js - cart page and checkout page logic. */
const FREE_DELIVERY_ABOVE = 500, DELIVERY_FEE = 49, TAX_RATE = 0.05;
function calcTotals(items) {                                            // subtotal, delivery, tax, grand total
  const subtotal = items.reduce((s, i) => s + unitPrice(i.product) * i.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE, tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, delivery, tax, total: subtotal + delivery + tax };
}
function summaryHtml(t) {                                               // order summary markup
  return `<h2>Order Summary</h2><p>Subtotal: ${formatPrice(t.subtotal)}</p><p>Delivery: ${t.delivery ? formatPrice(t.delivery) : "FREE"}</p><p>Tax (5%): ${formatPrice(t.tax)}</p><h3>Total: ${formatPrice(t.total)}</h3>`;
}
document.addEventListener("DOMContentLoaded", async () => {
  // ----- Cart page -----
  if ($("#cartItems")) {
    async function render() {
      try {
        const items = (await getCart()).data;
        if (!items.length) { $("#cartItems").innerHTML = '<div class="empty"><p>Your cart is empty.</p><a class="btn btn-primary" href="products.html">Continue shopping</a></div>'; $("#summary").hidden = true; return; }
        $("#summary").hidden = false;
        $("#cartItems").innerHTML = items.map((i) => `<div class="cart-row"><img src="${esc(i.product.image)}" alt="${esc(i.product.name)}"><div><h3>${esc(i.product.name)}</h3><p>${formatPrice(unitPrice(i.product))} each - Line total: <strong>${formatPrice(unitPrice(i.product) * i.qty)}</strong></p>
          <div class="qty"><button class="btn btn-secondary" data-act="dec" data-id="${esc(i.product.id)}" aria-label="Decrease quantity">-</button><span>${i.qty}</span><button class="btn btn-secondary" data-act="inc" data-id="${esc(i.product.id)}" aria-label="Increase quantity">+</button>
          <button class="btn btn-danger" data-act="del" data-id="${esc(i.product.id)}">Remove</button></div></div></div>`).join("");
        $("#totals").innerHTML = summaryHtml(calcTotals(items));
      } catch (e) { showToast("Could not load cart.", "error"); }
      updateCartBadge();
    }
    $("#cartItems").addEventListener("click", async (e) => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      const items = (await getCart()).data, cur = items.find((i) => i.product.id === b.dataset.id); let r = { success: true };
      if (b.dataset.act === "del") await removeFromCart(b.dataset.id);
      else if (b.dataset.act === "dec") r = cur.qty > 1 ? await updateCartItem(b.dataset.id, cur.qty - 1) : { success: false, message: "Minimum quantity is 1. Use Remove instead." };
      else r = await updateCartItem(b.dataset.id, cur.qty + 1);
      if (!r.success) showToast(r.message, "error"); render();
    });
    $("#checkoutBtn").addEventListener("click", async () => { const r = await getCurrentUser(); location.href = r.success ? "checkout.html" : "login.html?redirect=cart.html"; });
    render();
  }

  // ----- Checkout page -----
  if ($("#checkoutForm")) {
    const user = await requireLogin(); if (!user) return;
    const items = (await getCart()).data; if (!items.length) { location.href = "cart.html"; return; }
    const totals = calcTotals(items); $("#totals").innerHTML = summaryHtml(totals);
    const f = $("#checkoutForm"); f.elements.fullName.value = user.name; f.elements.phone.value = user.phone || ""; f.elements.address.value = user.address || "";
    setupForm(f, async (d) => {
      const r = await placeOrder({ total: totals.total, paymentMethod: d.payment, shippingAddress: { fullName: d.fullName, phone: d.phone, address: d.address, city: d.city, state: d.state, pincode: d.pincode } });
      if (!r.success) { showToast(r.message, "error"); return; }
      updateCartBadge(); $("#checkoutArea").innerHTML = `<div class="panel empty"><h1>Order placed! 🎉</h1><p>Your order id is <strong>${esc(r.data.id)}</strong></p><a class="btn btn-primary" href="orders.html">View my orders</a></div>`;
    });
  }
});
