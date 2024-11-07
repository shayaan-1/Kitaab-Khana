// controllers/bookController.js
const { createBook, getBookById, updateBook, deleteBook, searchBooks } = require("../models/bookModel");
  
  const createBookController = async (req, res) => {
  try {
    const book = { ...req.body, owner_id: req.user.id };
    const newBook = await createBook(book);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: "Error creating book", error });
  }
};
  
  const getBookController = async (req, res) => {
    try {
      const book = await getBookById(req.params.id);
      if (!book) return res.status(404).json({ message: "Book not found" });
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Error fetching book", error });
    }
  };
  
  const updateBookController = async (req, res) => {
    try {
      const book = await updateBook(req.params.id, req.body);
      if (!book) return res.status(404).json({ message: "Book not found" });
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Error updating book", error });
    }
  };
  
  const deleteBookController = async (req, res) => {
    try {
      const deleted = await deleteBook(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Book not found" });
      res.json({ message: "Book deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting book", error });
    }
  };
  
  const searchBooksController = async (req, res) => {
    const { term } = req.query;
    try {
      const books = await searchBooks(term);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Error searching for books", error });
    }
  };
  
  module.exports = { createBookController, getBookController, updateBookController, deleteBookController, searchBooksController };
  