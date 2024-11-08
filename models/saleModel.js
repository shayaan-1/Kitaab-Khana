// models/saleModel.js
const db = require("../config/db"); // Assuming you have a db connection file

const createSale = async (bookId, buyerId, salePrice) => {
    try {
        const query = "INSERT INTO sales (book_id, buyer_id, sale_price) VALUES ($1, $2, $3) RETURNING *";
        const values = [bookId, buyerId, salePrice]; // Sale status is 'pending' initially
        const result = await db.query(query, values);
        return result.rows[0]; // Return the created sale record
    } catch (err) {
        throw new Error("Error creating sale: " + err.message);
    }
};

const getSaleById = async (saleId) => {
    try {
        const query = "SELECT * FROM sales WHERE id = $1";
        const result = await db.query(query, [saleId]);
        return result.rows[0]; // Return the sale by its ID
    } catch (err) {
        throw new Error("Error fetching sale: " + err.message);
    }
};

const updateSaleStatus = async (saleId, status) => {
    try {
        const query = "UPDATE sales SET status = $1 WHERE id = $2 RETURNING *";
        const result = await db.query(query, [status, saleId]);
        return result.rows[0]; // Return the updated sale
    } catch (err) {
        throw new Error("Error updating sale status: " + err.message);
    }
};


module.exports = {
    createSale,
    getSaleById,
    updateSaleStatus
};
