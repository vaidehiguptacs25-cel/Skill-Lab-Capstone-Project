/* Cart model - one cart per user. */
const { Schema, model } = require("mongoose");
const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [{ _id: false, product: { type: Schema.Types.ObjectId, ref: "Product" }, qty: { type: Number, min: 1, default: 1 } }]
});
module.exports = model("Cart", cartSchema);
