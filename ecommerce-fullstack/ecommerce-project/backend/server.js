/* server.js - Express app entry point: middleware, routes, error handling. */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const origins = (process.env.CLIENT_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: origins }));                     // allow the Live Server frontend
app.use(express.json({ limit: "1mb" }));                // parse JSON bodies

app.get("/api/health", (req, res) => res.json({ success: true, data: "API is running" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));
// Central error handler: always answers in { success:false, message } shape
app.use((err, req, res, next) => {
  let status = err.status || 500, message = err.status ? err.message : "Server error. Please try again.";
  if (err.name === "ValidationError") { status = 400; message = Object.values(err.errors).map((e) => e.message).join(" "); }
  if (err.name === "CastError") { status = 404; message = "Not found."; }
  if (err.code === 11000) { status = 409; message = "That value already exists."; }
  if (status === 500) console.error(err);
  res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log("API running on http://localhost:" + PORT))).catch((e) => { console.error("MongoDB connection failed:", e.message); process.exit(1); });
