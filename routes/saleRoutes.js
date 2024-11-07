// routes/saleRoutes.js
const express = require("express");
const saleController = require("../controllers/saleController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/purchase", saleController.purchaseBook);

module.exports = router;
