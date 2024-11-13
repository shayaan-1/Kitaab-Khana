// controllers/rentalController.js
const rentalModel = require("../models/rentalModel");
const transactionModel = require("../models/transactionModel");
const bookModel = require("../models/bookModel"); // Add this to interact with the book data
const handlePayment = require("../middlewares/paymentMiddleware"); // Import your middleware
const dayjs = require("dayjs"); // Import dayjs for date manipulation


// Request a rental for a book
exports.requestRental = async (req, res) => {
    try {
        const { bookId, startDate, endDate } = req.body;
        const renterId = req.user.id;

        // Create the rental request
        const rentalRequest = await rentalModel.createRentalRequest(bookId, renterId, startDate, endDate);
        res.status(201).json({ message: "Rental request submitted", rental: rentalRequest });
    } catch (error) {
        res.status(500).json({ message: "Error creating rental request", error: error.message });
    }
};

exports.approveRental = async (req, res) => {
    const { rentalId } = req.params;
    
    // Get rental details
    const rental = await rentalModel.getRentalById(rentalId);
    if (!rental) {
        return res.status(404).json({ message: "Rental not found" });
    }

    // Calculate the rental fee (you can modify this based on your rental logic)
    const rentalFee = rentalModel.calculateRentalFee(rental); // Use the rental fee calculation function

    // Create a transaction and include rentalFee, status as "pending"
    const transaction = await transactionModel.createTransaction({
        rentalId: rental.id,
        amount: rentalFee,  // Pass the calculated rental fee as the amount
        status: "pending",
        transaction_type: "rental",
        paymentIntentId: null, // We will update this after payment intent is created
    });

    // Proceed to create the payment intent with the provided data (handled by middleware)
    req.body = {  // Attach necessary information to the request body
        amount: rentalFee * 100,  
        currency: 'usd',  
        customerId: req.user.stripeCustomerId,  // Customer's Stripe ID
        paymentMethodId: req.user.stripe_default_payment_method,  // Customer's default payment method
    };

    // Use the middleware to create the payment intent
    handlePayment(req, res, async () => {
        // Once the payment intent is created, you can proceed
        const paymentIntent = req.paymentIntent; // Get the payment intent from the request

        // Update the transaction with the payment intent ID
        await transactionModel.updateTransactionStatus(transaction.id, {
            paymentIntentId: paymentIntent.id,
            status: "pending",
        });

        // Update rental status to approved
        await rentalModel.updateRentalStatus(rentalId, "approved");

        res.status(200).json({ message: "Rental approved, awaiting payment", rental, transaction });
    });
};

exports.processPayment = async (req, res) => {
    const { transactionId, paymentIntentId } = req.body;
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    // Get the transaction by ID
    const transaction = await transactionModel.getTransactionById(transactionId);
    if (!transaction || transaction.status !== "pending") {
        return res.status(400).json({ message: "Invalid or already completed transaction" });
    }

    try {
        // Retrieve the PaymentIntent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // If payment is successful, update the transaction and rental
        if (paymentIntent.status === 'succeeded') {
            // Mark the transaction as completed first
            const updatedTransaction = await transactionModel.updateTransactionStatus(transactionId, {
                status: "completed",
                paymentIntentId: paymentIntent.id,
            });

            // Now, proceed with the rental and book updates
            const rental = await rentalModel.getRentalById(transaction.rental_id);

            // Mark rental as active
            await rentalModel.updateRentalStatus(transaction.rental_id, "active");

            // Update book availability to false (book is rented)
            await bookModel.updateBookAvailability(rental.book_id, false);

            res.status(200).json({ message: "Payment successful, rental is now active", transaction: updatedTransaction });
        } else {
            res.status(400).json({ message: "Payment failed", status: paymentIntent.status });
        }
    } catch (error) {
        res.status(500).json({ message: "Error processing payment", error: error.message });
    }
};

exports.returnRental = async (req, res) => {
    try {
        const { rentalId } = req.params;
        const { returnDate } = req.body; // Getting the return date from the request body

        // Get the rental record by ID
        const rental = await rentalModel.getRentalById(rentalId);
        if (!rental) {
            return res.status(404).json({ message: "Rental not found" });
        }

        // Check if the rental status is active
        if (rental.status !== "active") {
            return res.status(400).json({ message: "Rental cannot be returned as it is not currently active." });
        }

        // Convert the returnDate from the request body to a dayjs object
        const returnDayjs = dayjs(returnDate);
        const rentalEndDate = dayjs(rental.rental_end_date);

        // Calculate late days and late fee
        let lateFee = 0;
        const lateDays = returnDayjs.isAfter(rentalEndDate) ? returnDayjs.diff(rentalEndDate, "day") : 0;

        if (lateDays > 0) {
            const lateFeePerDay = 5; // Example late fee per day
            lateFee = lateDays * lateFeePerDay;
        }

        // Update the rental status to 'completed', set the return date, and store the late fee
        await rentalModel.updateRentalStatus(rentalId, "completed", returnDayjs.toDate(), lateFee);

        // Return the response with the late fee
        return res.json({ message: "Rental returned successfully", lateFee });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error returning rental", error: error.message });
    }
};