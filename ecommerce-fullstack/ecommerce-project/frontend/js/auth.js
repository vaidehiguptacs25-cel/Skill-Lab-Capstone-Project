/* auth.js - login and register pages. */
document.addEventListener("DOMContentLoaded", async () => {
  const cur = await getCurrentUser(); if (cur.success) { location.href = cur.data.role === "admin" ? "admin-dashboard.html" : "../index.html"; return; } // logged-in users skip this page
  document.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", () => { const i = document.getElementById(b.dataset.toggle); i.type = i.type === "password" ? "text" : "password"; b.textContent = i.type === "password" ? "Show" : "Hide"; }));
  const safeRedirect = () => { const r = new URLSearchParams(location.search).get("redirect"); return r && /^[\w-]+\.html(\?[\w=&%.-]*)?$/.test(r) ? r : null; }; // only same-folder pages
  if ($("#loginForm")) setupForm($("#loginForm"), async (d) => {
    const r = await loginUser(d.email, d.password); if (!r.success) { showToast(r.message, "error"); return; }
    showToast("Welcome back, " + r.data.name + "!"); location.href = r.data.role === "admin" ? "admin-dashboard.html" : safeRedirect() || "../index.html";
  });
  if ($("#registerForm")) setupForm($("#registerForm"), async (d) => {
    const r = await registerUser({ name: d.name, email: d.email, phone: d.phone, password: d.password, role: d.role === "seller" ? "admin" : "customer" });
    if (!r.success) { showToast(r.message, "error"); return; } showToast("Account created! Please log in."); setTimeout(() => { location.href = "login.html"; }, 800);
  });
});
