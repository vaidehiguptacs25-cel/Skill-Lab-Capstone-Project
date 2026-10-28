/* Order model - items are copied (name/price) so history stays correct if a product changes. */
const { Schema, model } = require("mongoose");
const jsonPlugin = require("./jsonPlugin");
const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: [{ _id: false, productId: String, name: String, price: Number, qty: Number }],
  total: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
  date: { type: Date, default: Date.now },
  shippingAddress: { fullName: String, phone: String, address: String, city: String, state: String, pincode: String },
  paymentMethod: { type: String, default: "Cash on Delivery" }
}, { timestamps: true });
orderSchema.plugin(jsonPlugin);
module.exports = model("Order", orderSchema);
