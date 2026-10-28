/* auth routes - POST /register, POST /login, GET /me */
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const wrap = require("../utils/wrap");
const { protect } = require("../middleware/auth");
const { httpError, ok, isEmail, isPhone, isPassword } = require("../utils/helpers");

// POST /api/auth/register - NOTE: demo lets sign-up choose "admin" (seller). Lock this down in production.
router.post("/register", wrap(async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (typeof name !== "string" || !name.trim()) throw httpError(400, "Name is required.");
  if (!isEmail(email)) throw httpError(400, "Enter a valid email like name@example.com.");
  if (!isPhone(phone)) throw httpError(400, "Phone must be exactly 10 digits.");
  if (!isPassword(password)) throw httpError(400, "Password needs 8+ characters with at least one letter and one number.");
  if (await User.findOne({ email: email.toLowerCase() })) throw httpError(409, "This email is already registered.");
  const user = await User.create({ name: name.trim(), email, phone, password, role: role === "admin" ? "admin" : "customer" });
  ok(res, user, 201);
}));

// POST /api/auth/login - returns { token, user }
router.post("/login", wrap(async (req, res) => {
  const { email, password } = req.body;
  if (!isEmail(email) || typeof password !== "string") throw httpError(400, "Email and password are required.");
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.matches(password))) throw httpError(401, "Incorrect email or password.");
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });
  ok(res, { token, user });
}));

// GET /api/auth/me - current user from token
router.get("/me", protect, (req, res) => ok(res, req.user));
module.exports = router;
