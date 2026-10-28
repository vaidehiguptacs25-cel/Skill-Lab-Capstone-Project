/* helpers.js - small shared helpers: errors, responses, validation. */
const httpError = (status, message) => Object.assign(new Error(message), { status });   // throwable error with status code
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });  // success response
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");              // safe text for RegExp
const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => typeof v === "string" && /^\d{10}$/.test(v);
const isPincode = (v) => typeof v === "string" && /^\d{6}$/.test(v);
const isPassword = (v) => typeof v === "string" && /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);
const calcTotals = (subtotal) => {                                                         // same rules as the frontend
  const delivery = subtotal >= 500 ? 0 : 49, tax = Math.round(subtotal * 0.05);
  return { subtotal, delivery, tax, total: subtotal + delivery + tax };
};
module.exports = { httpError, ok, escapeRegex, isEmail, isPhone, isPincode, isPassword, calcTotals };
