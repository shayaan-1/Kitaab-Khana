const db = require("../config/db");

const createTransaction = async ({ rentalId, amount, status, paymentIntentId, transaction_type }) => {
    const result = await db.query(
        `INSERT INTO transactions (rental_id, amount, status, payment_intent_id, transaction_type)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [rentalId, amount, status, paymentIntentId, transaction_type]
    );
    return result.rows[0];
};

const updateTransactionStatus = async (id, { status, paymentIntentId }) => {
    const result = await db.query(
        `UPDATE transactions SET status = $1, payment_intent_id = $2 WHERE id = $3 RETURNING *`,
        [status, paymentIntentId, id]
    );
    return result.rows[0];
};

// New method to update the transaction status by rental_id
const updateTransactionStatusByRentalId = async (rentalId, status) => {
    const result = await db.query(
        `UPDATE transactions SET status = $1 WHERE rental_id = $2 RETURNING *`,
        [status, rentalId]
    );
    return result.rows[0]; // Return the updated transaction
};

// Ensure this method is defined correctly
const getTransactionByRentalId = async (rentalId) => {
    const result = await db.query(
        `SELECT * FROM transactions WHERE rental_id = $1`,
        [rentalId]
    );
    return result.rows[0]; // Assuming there is only one transaction per rental
};


const getTransactionById = async (transactionId) => {
    try {
        const result = await db.query('SELECT * FROM transactions WHERE id = $1', [transactionId]);
        if (result.rows.length === 0) {
            throw new Error('Transaction not found');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching transaction:', error);
        throw new Error("Error fetching transaction: " + error.message);
    }
};

module.exports = {
    createTransaction,
    updateTransactionStatus,
    updateTransactionStatusByRentalId,
    getTransactionById,
    getTransactionByRentalId // Make sure this is exported
};
