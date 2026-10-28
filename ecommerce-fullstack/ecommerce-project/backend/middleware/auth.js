/* auth.js - JWT protection and admin-only guard. */
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const wrap = require("../utils/wrap");
const { httpError } = require("../utils/helpers");

// Requires a valid "Authorization: Bearer <token>" header
exports.protect = wrap(async (req, res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) throw httpError(401, "Please log in.");
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); } catch (e) { throw httpError(401, "Session expired. Please log in again."); }
  const user = await User.findById(payload.id);
  if (!user) throw httpError(401, "User no longer exists.");
  req.user = user; next();
});
// Only role "admin" (seller/admin) may continue
exports.adminOnly = (req, res, next) => (req.user.role === "admin" ? next() : next(httpError(403, "Admin access required.")));
