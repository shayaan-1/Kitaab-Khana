// routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');

const router = express.Router();

// Define the registration route
router.post('/register', registerUser);

// Define the login route
router.post('/login', loginUser);

// Define the logout route
router.post('/logout', logoutUser);

module.exports = router;
