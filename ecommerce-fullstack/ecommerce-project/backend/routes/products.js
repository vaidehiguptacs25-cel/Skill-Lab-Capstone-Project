/* product routes - public: list + detail. Admin: create, update, delete. */
const router = require("express").Router();
const Product = require("../models/Product");
const wrap = require("../utils/wrap");
const { protect, adminOnly } = require("../middleware/auth");
const { httpError, ok, escapeRegex } = require("../utils/helpers");

const PAGE_SIZE = 8;
const SORTS = { "price-asc": { finalPrice: 1 }, "price-desc": { finalPrice: -1 }, rating: { rating: -1 }, newest: { createdAt: -1 } };
const pick = (b) => ({ name: b.name, description: b.description, price: b.price, discountPrice: b.discountPrice || null, category: b.category, image: b.image, stock: b.stock }); // whitelist fields

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=
router.get("/", wrap(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page } = req.query, q = {};
  if (search) { const rx = new RegExp(escapeRegex(search), "i"); q.$or = [{ name: rx }, { description: rx }]; }
  if (category) q.category = String(category);
  if (minPrice || maxPrice) { q.finalPrice = {}; if (minPrice) q.finalPrice.$gte = Number(minPrice) || 0; if (maxPrice) q.finalPrice.$lte = Number(maxPrice) || 0; }
  const total = await Product.countDocuments(q), pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pg = Math.min(Math.max(1, parseInt(page) || 1), pages);
  const items = await Product.find(q).sort(SORTS[sort] || { createdAt: -1 }).skip((pg - 1) * PAGE_SIZE).limit(PAGE_SIZE);
  ok(res, { items, total, page: pg, pages });
}));
// GET /api/products/:id
router.get("/:id", wrap(async (req, res) => { const p = await Product.findById(req.params.id); if (!p) throw httpError(404, "Product not found."); ok(res, p); }));
// POST /api/products (admin)
router.post("/", protect, adminOnly, wrap(async (req, res) => ok(res, await Product.create({ ...pick(req.body), sellerId: req.user._id }), 201)));
// PUT /api/products/:id (admin)
router.put("/:id", protect, adminOnly, wrap(async (req, res) => {
  const p = await Product.findById(req.params.id); if (!p) throw httpError(404, "Product not found.");
  p.set(pick(req.body)); await p.save(); ok(res, p);     // save() so validation + finalPrice run
}));
// DELETE /api/products/:id (admin)
router.delete("/:id", protect, adminOnly, wrap(async (req, res) => { const p = await Product.findByIdAndDelete(req.params.id); if (!p) throw httpError(404, "Product not found."); ok(res, null); }));
module.exports = router;
