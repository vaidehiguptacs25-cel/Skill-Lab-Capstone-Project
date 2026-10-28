/* db.js - connects Mongoose to MongoDB. */
const mongoose = require("mongoose");
module.exports = async () => { await mongoose.connect(process.env.MONGO_URI); console.log("MongoDB connected"); };
