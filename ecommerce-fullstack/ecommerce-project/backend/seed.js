/* seed.js - wipes the DB and inserts demo users, products and orders. Run: npm run seed */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User"), Product = require("./models/Product"), Order = require("./models/Order"), Cart = require("./models/Cart");

const PRODUCTS = [
  [
    "Wireless Earbuds",
    "Electronics",
    2999,
    1999,
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Smart Watch",
    "Electronics",
    4999,
    0,
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Bluetooth Speaker",
    "Electronics",
    1999,
    1499,
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Denim Jacket",
    "Fashion",
    2499,
    1799,
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Running Shoes",
    "Fashion",
    3299,
    0,
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Cotton T-Shirt",
    "Fashion",
    599,
    399,
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "JavaScript Guide",
    "Books",
    799,
    599,
    "https://images.unsplash.com/photo-1532012164546-f432f2e37273?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Mystery Novel",
    "Books",
    349,
    0,
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Cooking Basics",
    "Books",
    499,
    399,
    "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Table Lamp",
    "Home",
    899,
    0,
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Cushion Set",
    "Home",
    1299,
    999,
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Wall Clock",
    "Home",
    749,
    0,
    "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Yoga Mat",
    "Sports",
    999,
    699,
    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Cricket Bat",
    "Sports",
    2199,
    0,
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Face Cream",
    "Beauty",
    449,
    349,
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
  ],
  [
    "Perfume",
    "Beauty",
    1599,
    1199,
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80"
  ]
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany(), Cart.deleteMany()]);

  const [admin, customer] = await Promise.all([
    User.create({ name: "Admin Seller", email: "admin@shop.com", password: "Admin1234", role: "admin", phone: "9000000001", address: "1 Market Road, Bengaluru" }),
    User.create({ name: "Asha Customer", email: "customer@shop.com", password: "Cust1234", role: "customer", phone: "9000000002", address: "22 Lake View, Mysuru" })
  ]);

  const products = [];
  for (const [i, p] of PRODUCTS.entries()) {
    products.push(await Product.create({
      name: p[0],
      category: p[1],
      price: p[2],
      discountPrice: p[3] || null,
      description: "A quality " + p[0].toLowerCase() + " made for everyday use. Great value and reliable.",
      image: p[4],
      stock: i % 7 === 0 ? 0 : 5 + i * 2,
      rating: 3.5 + (i % 4) * 0.4,
      reviewsCount: 10 + i * 7,
      sellerId: admin._id
    }));
  }

  for (const [i, status] of ["Pending", "Shipped", "Delivered"].entries()) {
    await Order.create({
      user: customer._id,
      status,
      date: new Date(2026, 8, 5 + i * 5),
      total: products[i].finalPrice + 100,
      items: [{ productId: String(products[i]._id), name: products[i].name, price: products[i].finalPrice, qty: 1 }],
      shippingAddress: { fullName: "Asha Customer", phone: "9000000002", address: "22 Lake View", city: "Mysuru", state: "Karnataka", pincode: "570001" }
    });
  }

  console.log("Seeded: 2 users, " + products.length + " products, 3 orders");
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
