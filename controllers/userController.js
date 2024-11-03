// controllers/userController.js
const bcrypt = require("bcrypt");
const { createUser, getUserById, updateUser, deleteUser } = require("../models/userModel");

const registerUser = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Move initialization here
  
  const { name, email, password, phoneNumber, city, dateOfBirth } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create Stripe customer
  const stripeCustomer = await stripe.customers.create({ name, email, phone: phoneNumber });

  // Store user in DB
  const user = await createUser({
    name,
    email,
    password: hashedPassword,
    phoneNumber,
    city,
    dateOfBirth,
    stripeCustomerId: stripeCustomer.id,
    defaultPaymentMethodId: null,
  });

  res.status(201).json(user);
};

const getUser = async (req, res) => {
  const user = await getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

const updateUserDetails = async (req, res) => {
  const user = await updateUser(req.params.id, req.body);
  res.json(user);
};

const deleteUserAccount = async (req, res) => {
  const deleted = await deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ error: "User not found" });
  res.json({ message: "User deleted" });
};

module.exports = { registerUser, getUser, updateUserDetails, deleteUserAccount };
