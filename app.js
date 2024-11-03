// app.js
const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);

module.exports = app;
