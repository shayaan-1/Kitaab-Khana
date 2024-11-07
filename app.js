// app.js
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes'); // Import the auth routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const saleRoutes = require("./routes/saleRoutes");
const authenticateUser = require("./middlewares/authMiddleware");


dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/rental", authenticateUser.authenticateUser ,rentalRoutes);
app.use("/api/sale",saleRoutes);




module.exports = app;

