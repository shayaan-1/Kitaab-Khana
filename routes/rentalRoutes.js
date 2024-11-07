const express = require("express");
const router = express.Router();
const rentalController = require("../controllers/rentalController");

// Route for requesting a rental
router.post("/request", rentalController.requestRental);

// Approve rental
router.post("/approve/:rentalId", rentalController.approveRental);

// Process payment
router.post("/payment", rentalController.processPayment);


module.exports = router;
