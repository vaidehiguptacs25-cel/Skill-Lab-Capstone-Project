/* user routes - PUT /me updates the logged-in user's profile */
const router = require("express").Router();
const wrap = require("../utils/wrap");
const { protect } = require("../middleware/auth");
const { httpError, ok, isPhone } = require("../utils/helpers");

router.put("/me", protect, wrap(async (req, res) => {
  const { name, phone, address } = req.body;
  if (typeof name !== "string" || !name.trim()) throw httpError(400, "Name is required.");
  if (!isPhone(phone)) throw httpError(400, "Phone must be exactly 10 digits.");
  req.user.name = name.trim(); req.user.phone = phone; req.user.address = typeof address === "string" ? address.trim() : "";
  await req.user.save(); ok(res, req.user);
}));
module.exports = router;
