// routes/bookRoutes.js
const express = require("express");
const { createBookController, getBookController, updateBookController, deleteBookController, searchBooksController } = require("../controllers/bookController");
const {authenticateUser} = require("../middlewares/authMiddleware");
const {authorizeBookOwner} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticateUser, createBookController);
router.get("/:id", authenticateUser, getBookController);
router.put("/:id", authenticateUser, authorizeBookOwner, updateBookController);
router.delete("/:id", authenticateUser, authorizeBookOwner, deleteBookController);
router.get("/search", authenticateUser, searchBooksController); // Add search route

module.exports = router;
