// models/saleModel.js
const db = require("../config/db");

const recordSale = async (bookId, buyerId, salePrice) => {
    const result = await db.query(
        `INSERT INTO sales (book_id, buyer_id, sale_price) VALUES ($1, $2, $3) RETURNING *`,
        [bookId, buyerId, salePrice]
    );
    await db.query(`UPDATE books SET availability_status = 'Sold', owner_id = $2 WHERE id = $1`, [bookId, buyerId]);
    return result.rows[0];
};

module.exports = { recordSale };
