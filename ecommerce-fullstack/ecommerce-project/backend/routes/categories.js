/* GET /api/categories */
const router = require("express").Router();
const { ok } = require("../utils/helpers");
router.get("/", (req, res) => ok(res, require("../config/categories")));
module.exports = router;
