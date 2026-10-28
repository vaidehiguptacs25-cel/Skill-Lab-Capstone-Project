/* order routes - POST / (place), GET /my, GET / (admin), PUT /:id/status (admin) */
const router = require("express").Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const wrap = require("../utils/wrap");
const { protect, adminOnly } = require("../middleware/auth");
const { httpError, ok, isPhone, isPincode, calcTotals } = require("../utils/helpers");
router.use(protect);

const PAYMENTS = ["Cash on Delivery", "Card / UPI (demo)"];
// POST /api/orders - total is calculated on the server from real prices (never trust the client)
router.post("/", wrap(async (req, res) => {
  const a = req.body.shippingAddress || {};
  for (const f of ["fullName", "address", "city", "state"]) if (typeof a[f] !== "string" || !a[f].trim()) throw httpError(400, "Shipping " + f + " is required.");
  if (!isPhone(a.phone)) throw httpError(400, "Phone must be exactly 10 digits.");
  if (!isPincode(a.pincode)) throw httpError(400, "Pincode must be exactly 6 digits.");
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  const lines = cart ? cart.items.filter((i) => i.product) : [];
  if (!lines.length) throw httpError(400, "Your cart is empty.");
  const done = [];                                           // lines already deducted (for rollback)
  try {
    for (const l of lines) {                                 // atomic stock check + deduct
      const r = await Product.updateOne({ _id: l.product._id, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty } });
      if (!r.modifiedCount) throw httpError(400, l.product.name + " does not have enough stock.");
      done.push(l);
    }
  } catch (e) { for (const l of done) await Product.updateOne({ _id: l.product._id }, { $inc: { stock: l.qty } }); throw e; }
  const subtotal = lines.reduce((s, l) => s + l.product.finalPrice * l.qty, 0);
  const order = await Order.create({
    user: req.user._id, total: calcTotals(subtotal).total, shippingAddress: { fullName: a.fullName.trim(), phone: a.phone, address: a.address.trim(), city: a.city.trim(), state: a.state.trim(), pincode: a.pincode },
    paymentMethod: PAYMENTS.includes(req.body.paymentMethod) ? req.body.paymentMethod : PAYMENTS[0],
    items: lines.map((l) => ({ productId: String(l.product._id), name: l.product.name, price: l.product.finalPrice, qty: l.qty }))
  });
  await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } }); ok(res, order, 201);
}));
router.get("/my", wrap(async (req, res) => ok(res, await Order.find({ user: req.user._id }).sort({ date: -1 }))));
router.get("/", adminOnly, wrap(async (req, res) => ok(res, await Order.find().sort({ date: -1 }))));
router.put("/:id/status", adminOnly, wrap(async (req, res) => {
  if (!["Pending", "Shipped", "Delivered", "Cancelled"].includes(req.body.status)) throw httpError(400, "Invalid status.");
  const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); if (!o) throw httpError(404, "Order not found."); ok(res, o);
}));
module.exports = router;
