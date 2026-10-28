/* mockData.js - fake data. Only api.js may read these (seeded once into localStorage). */
const MOCK_CATEGORIES = ["Electronics", "Fashion", "Books", "Home", "Sports", "Beauty"];
// [name, category, price, discountPrice (0 = none)]
const MOCK_PRODUCTS = [
  ["Wireless Earbuds", "Electronics", 2999, 1999], ["Smart Watch", "Electronics", 4999, 0], ["Bluetooth Speaker", "Electronics", 1999, 1499],
  ["Denim Jacket", "Fashion", 2499, 1799], ["Running Shoes", "Fashion", 3299, 0], ["Cotton T-Shirt", "Fashion", 599, 399],
  ["JavaScript Guide", "Books", 799, 599], ["Mystery Novel", "Books", 349, 0], ["Cooking Basics", "Books", 499, 399],
  ["Table Lamp", "Home", 899, 0], ["Cushion Set", "Home", 1299, 999], ["Wall Clock", "Home", 749, 0],
  ["Yoga Mat", "Sports", 999, 699], ["Cricket Bat", "Sports", 2199, 0], ["Face Cream", "Beauty", 449, 349], ["Perfume", "Beauty", 1599, 1199]
].map((p, i) => ({
  id: "p" + (i + 1), name: p[0], description: "A quality " + p[0].toLowerCase() + " made for everyday use. Great value and reliable.",
  price: p[2], discountPrice: p[3] || null, category: p[1], image: "https://picsum.photos/seed/shop" + (i + 1) + "/400/300",
  stock: i % 7 === 0 ? 0 : 5 + i * 2, rating: 3.5 + (i % 4) * 0.4, reviewsCount: 10 + i * 7, sellerId: "u1", createdAt: new Date(2026, 0, i + 1).toISOString()
}));
// Demo passwords only. Real hashing happens in the backend later.
const MOCK_USERS = [
  { id: "u1", name: "Admin Seller", email: "admin@shop.com", password: "Admin1234", role: "admin", phone: "9000000001", address: "1 Market Road, Bengaluru" },
  { id: "u2", name: "Asha Customer", email: "customer@shop.com", password: "Cust1234", role: "customer", phone: "9000000002", address: "22 Lake View, Mysuru" },
  { id: "u3", name: "Ravi Buyer", email: "ravi@shop.com", password: "Ravi1234", role: "customer", phone: "9000000003", address: "5 Hill Street, Pune" }
];
const MOCK_ORDERS = ["Pending", "Shipped", "Delivered"].map((status, i) => ({
  id: "ORD100" + (i + 1), userId: "u2", status, date: new Date(2026, 8, 5 + i * 5).toISOString(), total: 2099 + i * 500,
  items: [{ productId: "p" + (i + 1), name: MOCK_PRODUCTS[i].name, price: MOCK_PRODUCTS[i].discountPrice || MOCK_PRODUCTS[i].price, qty: 1 }],
  shippingAddress: { fullName: "Asha Customer", phone: "9000000002", address: "22 Lake View", city: "Mysuru", state: "Karnataka", pincode: "570001" }, paymentMethod: "Cash on Delivery"
}));
