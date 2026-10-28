/* cart routes (login required): GET, POST, PUT /:productId, DELETE /:productId, DELETE / */
const router = require("express").Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const wrap = require("../utils/wrap");
const { protect } = require("../middleware/auth");
const { httpError, ok } = require("../utils/helpers");
router.use(protect);

const getCart = async (userId) => (await Cart.findOne({ user: userId })) || Cart.create({ user: userId, items: [] });   // one cart per user
async function send(res, userId) {                                           // respond with [{ product, qty }]
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  const items = cart ? cart.items.filter((i) => i.product).map((i) => ({ product: i.product.toJSON(), qty: i.qty })) : [];
  ok(res, items);
}
const checkQty = (qty) => { if (!Number.isInteger(qty) || qty < 1) throw httpError(400, "Quantity must be a whole number of at least 1."); };

router.get("/", wrap(async (req, res) => send(res, req.user._id)));
router.post("/", wrap(async (req, res) => {                                  // add (merges with existing line)
  const { productId } = req.body, qty = Number(req.body.qty ?? 1); checkQty(qty);
  const p = await Product.findById(productId); if (!p) throw httpError(404, "Product not found.");
  if (p.stock < 1) throw httpError(400, "This product is out of stock.");
  const cart = await getCart(req.user._id), line = cart.items.find((i) => String(i.product) === String(p._id));
  const newQty = (line ? line.qty : 0) + qty; if (newQty > p.stock) throw httpError(400, "Only " + p.stock + " in stock.");
  if (line) line.qty = newQty; else cart.items.push({ product: p._id, qty });
  await cart.save(); send(res, req.user._id);
}));
router.put("/:productId", wrap(async (req, res) => {                        // set exact quantity
  const qty = Number(req.body.qty); checkQty(qty);
  const p = await Product.findById(req.params.productId); if (!p) throw httpError(404, "Product not found.");
  if (qty > p.stock) throw httpError(400, "Only " + p.stock + " in stock.");
  const cart = await getCart(req.user._id), line = cart.items.find((i) => String(i.product) === String(p._id));
  if (!line) throw httpError(404, "Item not in cart."); line.qty = qty; await cart.save(); send(res, req.user._id);
}));
router.delete("/:productId", wrap(async (req, res) => {                     // remove one item
  await Cart.updateOne({ user: req.user._id }, { $pull: { items: { product: req.params.productId } } }); send(res, req.user._id);
}));
router.delete("/", wrap(async (req, res) => { await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } }); ok(res, null); }));
module.exports = router;
