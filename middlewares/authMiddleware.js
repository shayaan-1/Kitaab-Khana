// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const { getBookById } = require("../models/bookModel");

const authorizeBookOwner = async (req, res, next) => {
  const book = await getBookById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  
  if (book.owner_id !== req.user.id) {
    return res.status(403).json({ message: "You are not authorized to modify this book" });
  }

  next();
};

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = {authenticateUser , authorizeBookOwner};
