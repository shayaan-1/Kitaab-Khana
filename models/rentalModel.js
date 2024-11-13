// models/rentalModel.js
const db = require("../config/db");
const bookModel = require("../models/bookModel");

// Function to calculate rental fee
const calculateRentalFee = (rental) => {
    // Calculate the number of days between start and end date
    const rentalDays = (new Date(rental.rental_end_date) - new Date(rental.rental_start_date)) / (1000 * 3600 * 24);
    // Calculate the total rental fee
    return rental.rental_price * rentalDays;
};

// Function to create a rental request
const createRentalRequest = async (bookId, renterId, startDate, endDate) => {
    try {
        // Check if the book is available and retrieve rental price
        const book = await bookModel.getRentalPriceById(bookId);
        if (!book) {
            throw new Error("Book not found.");
        }
        if (book.availability_status !== "true") {
            throw new Error("Book is currently unavailable for rental.");
        }

        // Insert rental request
        const result = await db.query(
            `INSERT INTO rentals (book_id, renter_id, rental_start_date, rental_end_date, status)
            VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
            [bookId, renterId, startDate, endDate]
        );
        return result.rows[0]; // Return the rental request details
    } catch (error) {
        throw new Error(`Error creating rental request: ${error.message}`);
    }
};

// models/rentalModel.js
const getRentalById = async (rentalId) => {
    const rentalQuery = `
        SELECT rentals.*, books.rental_price 
        FROM rentals 
        JOIN books ON rentals.book_id = books.id
        WHERE rentals.id = $1
    `;
    
    const result = await db.query(rentalQuery, [rentalId]);
    if (result.rows.length === 0) {
        throw new Error("Rental not found");
    }
    return result.rows[0];
};


const updateRentalStatus = async (id, status, returnDate = null, lateFee = 0) => {
    const query = returnDate
        ? `UPDATE rentals SET status = $1, return_date = $2, late_fee = $3 WHERE id = $4 RETURNING *`
        : `UPDATE rentals SET status = $1 WHERE id = $2 RETURNING *`;
    const values = returnDate ? [status, returnDate, lateFee, id] : [status, id];

    return (await db.query(query, values)).rows[0];
};


// Export the functions
module.exports = { createRentalRequest, updateRentalStatus, getRentalById, calculateRentalFee };
