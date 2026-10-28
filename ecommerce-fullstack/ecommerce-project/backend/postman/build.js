/* build.js - generates the Postman collection JSON. Run: node postman/build.js */
const fs = require("fs");
const js = (...lines) => [{ listen: "test", script: { type: "text/javascript", exec: lines } }];
const r = (name, method, path, body, test, noAuth) => ({
  name, event: test, request: { method, header: body ? [{ key: "Content-Type", value: "application/json" }] : [],
    auth: noAuth ? { type: "noauth" } : undefined, url: "{{baseUrl}}" + path, body: body ? { mode: "raw", raw: JSON.stringify(body, null, 2) } : undefined }
});
const login = (who, email, pw) => r("Login (" + who + ")", "POST", "/auth/login", { email, password: pw },
  js("const j = pm.response.json();", "if (j.success) { pm.collectionVariables.set('token', j.data.token); }", "pm.test('logged in', () => pm.expect(j.success).to.eql(true));"), true);
const addr = { fullName: "Asha Customer", phone: "9000000002", address: "22 Lake View", city: "Mysuru", state: "Karnataka", pincode: "570001" };
const col = {
  info: { name: "E-Commerce API", schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  auth: { type: "bearer", bearer: [{ key: "token", value: "{{token}}", type: "string" }] },
  variable: [{ key: "baseUrl", value: "http://localhost:5000/api" }, { key: "token", value: "" }, { key: "productId", value: "" }, { key: "orderId", value: "" }],
  item: [
    { name: "Auth", item: [
      r("Health", "GET", "/health", null, null, true),
      r("Register", "POST", "/auth/register", { name: "New User", email: "new@shop.com", phone: "9123456780", password: "Pass1234", role: "customer" }, null, true),
      login("customer", "customer@shop.com", "Cust1234"), login("admin", "admin@shop.com", "Admin1234"),
      r("Me", "GET", "/auth/me"), r("Update profile", "PUT", "/users/me", { name: "Asha Customer", phone: "9000000002", address: "22 Lake View, Mysuru" })] },
    { name: "Products", item: [
      r("List products", "GET", "/products?search=&category=Books&sort=price-asc&page=1", null, js("const j = pm.response.json();", "if (j.success && j.data.items.length) pm.collectionVariables.set('productId', j.data.items[0].id);"), true),
      r("Get product", "GET", "/products/{{productId}}", null, null, true), r("Categories", "GET", "/categories", null, null, true),
      r("Create product (admin)", "POST", "/products", { name: "Test Mug", description: "Ceramic mug", price: 299, discountPrice: 249, category: "Home", stock: 20, image: "" }, js("const j = pm.response.json();", "if (j.success) pm.collectionVariables.set('productId', j.data.id);")),
      r("Update product (admin)", "PUT", "/products/{{productId}}", { name: "Test Mug v2", description: "Ceramic mug", price: 349, category: "Home", stock: 15 }),
      r("Delete product (admin)", "DELETE", "/products/{{productId}}")] },
    { name: "Cart (customer)", item: [
      r("Get cart", "GET", "/cart"), r("Add to cart", "POST", "/cart", { productId: "{{productId}}", qty: 2 }),
      r("Update quantity", "PUT", "/cart/{{productId}}", { qty: 3 }), r("Remove item", "DELETE", "/cart/{{productId}}"), r("Clear cart", "DELETE", "/cart")] },
    { name: "Orders", item: [
      r("Place order (customer)", "POST", "/orders", { shippingAddress: addr, paymentMethod: "Cash on Delivery" }, js("const j = pm.response.json();", "if (j.success) pm.collectionVariables.set('orderId', j.data.id);")),
      r("My orders (customer)", "GET", "/orders/my"), r("All orders (admin)", "GET", "/orders"),
      r("Update status (admin)", "PUT", "/orders/{{orderId}}/status", { status: "Shipped" })] }
  ]
};
fs.writeFileSync(__dirname + "/ecommerce-api.postman_collection.json", JSON.stringify(col, null, 2));
