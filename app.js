// app.js
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes'); // Import the auth routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");


dotenv.config();
const app = express();
// Middleware
app.use(bodyParser.json());


app.use(express.json());

app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/books", bookRoutes);



module.exports = app;

