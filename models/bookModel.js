// models/bookModel.js
const db = require("../config/db");

// Create a new book
const createBook = async (book) => {
  const { title, author, description, condition, availability_status, image_url, owner_id } = book;
  const result = await db.query(
    "INSERT INTO books (title, author, description, condition, availability_status, image_url, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [title, author, description, condition, availability_status, image_url, owner_id]
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
  const { title, author, description, condition, availability_status, image_url } = bookData;
  const result = await db.query(
    "UPDATE books SET title = $1, author = $2, description = $3, condition = $4, availability_status = $5, image_url = $6 WHERE id = $7 RETURNING *",
    [title, author, description, condition, availability_status, image_url, id]
  );
  return result.rows[0];
};

// Delete a book
const deleteBook = async (id) => {
  const result = await db.query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);
  return result.rowCount > 0; // Returns true if a book was deleted
};

// Search for books by title or author using regex
const searchBooks = async (searchTerm) => {
  const result = await db.query(
    "SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $1",
    [`%${searchTerm}%`]
  );
  return result.rows;
};

module.exports = {
  createBook,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
};
