// routes/saleRoutes.js
const express = require("express");
const saleController = require("../controllers/saleController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/request", authMiddleware.authenticateUser, saleController.requestSale);
router.post("/process-payment", authMiddleware.authenticateUser, saleController.processSalePayment);
router.put("/approve/:saleId", authMiddleware.authenticateUser, saleController.approveSale);


module.exports = router;
