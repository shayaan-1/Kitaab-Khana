// middlewares/paymentMiddleware.js
const handlePayment = async (req, res, next) => {
    // Initialize Stripe with your secret key
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    const { amount, currency, customerId } = req.body;

    // Hardcoded test Visa card payment method ID (for Stripe's testing environment)
    const visaTestCard = "pm_card_visa";  // Stripe test Visa card ID

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer: customerId,
            payment_method: visaTestCard,  // Use Stripe's test Visa card
            confirm: true,
            return_url: "https://yourdomain.com/return-url"  // Add your actual return URL here
        });

        req.paymentIntent = paymentIntent;
        next();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = handlePayment;
