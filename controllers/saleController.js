// controllers/saleController.js
const saleModel = require("../models/saleModel");
const transactionModel = require("../models/transactionModel");

exports.purchaseBook = async (req, res) => {
    // Localize Stripe initialization inside the function
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    
    const { bookId, salePrice, paymentMethodId } = req.body;
    const buyerId = req.user.id;

    try {
        // Step 1: Create the payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: salePrice * 100, // Stripe expects the amount in cents
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
        });

        // Step 2: Create the transaction record with a "completed" status after successful payment
        const transaction = await transactionModel.createTransaction({
            userId: buyerId,
            bookId,
            type: 'sale',
            amount: salePrice,
            status: 'completed', // Mark the transaction as completed
            stripePaymentIntentId: paymentIntent.id // Store the Stripe Payment Intent ID for reference
        });

        // Step 3: Record the sale to transfer book ownership to the buyer
        const sale = await saleModel.recordSale(bookId, buyerId, salePrice);

        // Step 4: Respond with sale and transaction details
        res.status(201).json({ message: "Purchase successful", sale, transaction });
    } catch (error) {
        console.error("Error during payment processing:", error);
        res.status(400).json({ error: "Payment failed. Please try again." });
    }
};
