/* seed.js - wipes the DB and inserts demo users, products and orders. Run: npm run seed */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User"), Product = require("./models/Product"), Order = require("./models/Order"), Cart = require("./models/Cart");

const PRODUCTS = [
  ["Wireless Earbuds", "Electronics", 2999, 1999], ["Smart Watch", "Electronics", 4999, 0], ["Bluetooth Speaker", "Electronics", 1999, 1499],
  ["Denim Jacket", "Fashion", 2499, 1799], ["Running Shoes", "Fashion", 3299, 0], ["Cotton T-Shirt", "Fashion", 599, 399],
  ["JavaScript Guide", "Books", 799, 599], ["Mystery Novel", "Books", 349, 0], ["Cooking Basics", "Books", 499, 399],
  ["Table Lamp", "Home", 899, 0], ["Cushion Set", "Home", 1299, 999], ["Wall Clock", "Home", 749, 0],
  ["Yoga Mat", "Sports", 999, 699], ["Cricket Bat", "Sports", 2199, 0], ["Face Cream", "Beauty", 449, 349], ["Perfume", "Beauty", 1599, 1199]
];
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany(), Cart.deleteMany()]);
  const [admin, customer] = await Promise.all([
    User.create({ name: "Admin Seller", email: "admin@shop.com", password: "Admin1234", role: "admin", phone: "9000000001", address: "1 Market Road, Bengaluru" }),
    User.create({ name: "Asha Customer", email: "customer@shop.com", password: "Cust1234", role: "customer", phone: "9000000002", address: "22 Lake View, Mysuru" })
  ]);
  const products = [];
  for (const [i, p] of PRODUCTS.entries()) products.push(await Product.create({
    name: p[0], category: p[1], price: p[2], discountPrice: p[3] || null, description: "A quality " + p[0].toLowerCase() + " made for everyday use. Great value and reliable.",
    image: "https://picsum.photos/seed/shop" + (i + 1) + "/400/300", stock: i % 7 === 0 ? 0 : 5 + i * 2, rating: 3.5 + (i % 4) * 0.4, reviewsCount: 10 + i * 7, sellerId: admin._id
  }));
  for (const [i, status] of ["Pending", "Shipped", "Delivered"].entries()) await Order.create({
    user: customer._id, status, date: new Date(2026, 8, 5 + i * 5), total: products[i].finalPrice + 100,
    items: [{ productId: String(products[i]._id), name: products[i].name, price: products[i].finalPrice, qty: 1 }],
    shippingAddress: { fullName: "Asha Customer", phone: "9000000002", address: "22 Lake View", city: "Mysuru", state: "Karnataka", pincode: "570001" }
  });
  console.log("Seeded: 2 users, " + products.length + " products, 3 orders");
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
