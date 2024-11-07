// models/bookModel.js
const db = require("../config/db");

// Create a new book
const createBook = async (book) => {
  const { title, author, description, condition, availability_status, image_url, owner_id, genre, sale_price, rental_price } = book;
  const result = await db.query(
    "INSERT INTO books (title, author, description, condition, availability_status, image_url, owner_id, genre, sale_price, rental_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
    [title, author, description, condition, availability_status, image_url, owner_id, genre, sale_price, rental_price]
  );
  return result.rows[0];
};

// Get a book by ID
const getBookById = async (id) => {
  const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
  return result.rows[0];
};

// Update a book
const updateBook = async (id, bookData) => {
  const { title, author, description, condition, availability_status, image_url, genre, sale_price, rental_price } = bookData;
  const result = await db.query(
    "UPDATE books SET title = $1, author = $2, description = $3, condition = $4, availability_status = $5, image_url = $6, genre = $7, sale_price = $8, rental_price = $9 WHERE id = $10 RETURNING *",
    [title, author, description, condition, availability_status, image_url, genre, sale_price, rental_price, id]
  );
  return result.rows[0];
};

// Search for books by title, author, or genre using regex
const searchBooks = async (searchTerm) => {
  const result = await db.query(
    "SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $1 OR genre ILIKE $1",
    [`%${searchTerm}%`]
  );
  return result.rows;
};

// Delete a book
const deleteBook = async (id) => {
  const result = await db.query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);
  return result.rowCount > 0; // Returns true if a book was deleted
};

// Get rental price by book ID
const getRentalPriceById = async (id) => {
  const result = await db.query("SELECT rental_price, availability_status FROM books WHERE id = $1", [id]);
  return result.rows[0];
};

// Update book availability
const updateBookAvailability = async (bookId, availability) => {
  const result = await db.query(
      `UPDATE books SET availability_status = $1 WHERE id = $2 RETURNING *`,
      [availability, bookId]
  );
  return result.rows[0];
};

module.exports = {
  createBook,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
  updateBookAvailability,
  getRentalPriceById
};
