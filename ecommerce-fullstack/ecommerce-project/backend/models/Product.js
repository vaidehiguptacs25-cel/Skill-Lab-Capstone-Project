/* Product model. finalPrice = discountPrice || price (used for filtering and sorting). */
const { Schema, model } = require("mongoose");
const jsonPlugin = require("./jsonPlugin");
const CATEGORIES = require("../config/categories");

const productSchema = new Schema({
  name: { type: String, required: [true, "Product name is required."], trim: true, maxlength: 120 },
  description: { type: String, required: [true, "Description is required."], maxlength: 2000 },
  price: { type: Number, required: true, min: [0.01, "Price must be greater than 0."] },
  discountPrice: { type: Number, default: null, min: 0 },
  finalPrice: { type: Number, index: true },
  category: { type: String, required: true, enum: { values: CATEGORIES, message: "Invalid category." }, index: true },
  image: { type: String, default: "" },
  stock: { type: Number, required: true, min: [0, "Stock cannot be negative."], validate: { validator: Number.isInteger, message: "Stock must be a whole number." } },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  sellerId: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
productSchema.index({ name: "text", description: "text" });
productSchema.pre("validate", function () {
  if (this.discountPrice && this.discountPrice >= this.price) this.invalidate("discountPrice", "Discount price must be lower than price.");
  this.finalPrice = this.discountPrice || this.price;
});
productSchema.plugin(jsonPlugin);
module.exports = model("Product", productSchema);
