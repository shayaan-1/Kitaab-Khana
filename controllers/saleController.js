// controllers/saleController.js
const saleModel = require("../models/saleModel");
const transactionModel = require("../models/transactionModel");
const bookModel = require("../models/bookModel");
const handlePayment = require("../middlewares/paymentMiddleware");

// Request to initiate the sale of a book
exports.requestSale = async (req, res) => {
    try {
        const { bookId, salePrice } = req.body;
        const buyerId = req.user.id;

        const book = await bookModel.getBookById(bookId);
        if (!book || book.availability_status !== "true") {
            return res.status(404).json({ message: "Book not available for sale" });
        }

        const saleRequest = await saleModel.createSale(bookId, buyerId, salePrice);
        const transaction = await transactionModel.createSaleTransaction({
            saleId: saleRequest.id,
            userId: buyerId,
            bookId,
            amount: salePrice,
            status: "pending",
            paymentIntentId: null,
        });

        req.body = {
            amount: salePrice * 100,
            currency: 'usd',
            customerId: req.user.stripeCustomerId,
        };

        handlePayment(req, res, async () => {
            const paymentIntent = req.paymentIntent;

            await transactionModel.updateTransactionStatus(transaction.id, {
                status: "pending",
                paymentIntentId: paymentIntent.id,
            });

            res.status(200).json({
                message: "Sale request initiated, awaiting payment",
                saleRequest,
                transaction,
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Error initiating sale", error: error.message });
    }
};

// Seller approves the sale
exports.approveSale = async (req, res) => {
    const { saleId } = req.params;
    const sale = await saleModel.getSaleById(saleId);
    if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
    }

    const book = await bookModel.getBookById(sale.book_id);
    if (book.availability_status !== "true") {
        return res.status(400).json({ message: "Book no longer available for sale" });
    }

    await saleModel.updateSaleStatus(saleId, "approved");
    res.status(200).json({ message: "Sale approved, awaiting payment", sale });
};

// Process the payment for the sale
exports.processSalePayment = async (req, res) => {
    const { transactionId, paymentIntentId } = req.body;
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    try {
        const transaction = await transactionModel.getTransactionById(transactionId);

        if (!transaction || transaction.status !== "pending") {
            return res.status(400).json({ message: "Invalid or already completed transaction" });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === "succeeded") {
            const updatedTransaction = await transactionModel.updateTransactionStatus(transactionId, {
                status: "completed",
                paymentIntentId: paymentIntent.id,
            });

            await bookModel.updateBookOwner(transaction.book_id, transaction.user_id);
            await bookModel.updateBookAvailability(transaction.book_id, false);

            res.status(200).json({ message: "Payment successful, sale completed, and ownership transferred", transaction: updatedTransaction });
        } else {
            res.status(400).json({ message: "Payment failed", status: paymentIntent.status });
        }
    } catch (error) {
        res.status(500).json({ message: "Error processing payment", error: error.message });
    }
};
