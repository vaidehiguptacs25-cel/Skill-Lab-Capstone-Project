/* jsonPlugin.js - makes JSON output frontend-friendly: _id becomes id, hides password and __v. */
module.exports = (schema) => schema.set("toJSON", {
  versionKey: false,
  transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.password; return ret; }
});
