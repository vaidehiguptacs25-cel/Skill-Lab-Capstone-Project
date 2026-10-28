/* User model - customers and sellers/admins. Passwords are hashed with bcrypt. */
const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const jsonPlugin = require("./jsonPlugin");

const userSchema = new Schema({
  name: { type: String, required: [true, "Name is required."], trim: true, maxlength: 80 },
  email: { type: String, required: [true, "Email is required."], unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" }
}, { timestamps: true });
userSchema.pre("save", async function () { if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 10); }); // hash before saving
userSchema.methods.matches = function (plain) { return bcrypt.compare(plain, this.password); };                                        // compare login password
userSchema.plugin(jsonPlugin);
module.exports = model("User", userSchema);
