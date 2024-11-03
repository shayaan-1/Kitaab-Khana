// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, getUserByEmail } = require("../models/userModel");

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
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

  // Create JWT token
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
};

const logoutUser = (req, res) => {
  // Invalidate the token on the client side or manage sessions if you have a session store.
  res.json({ message: "User logged out" });
};

module.exports = { registerUser, loginUser, logoutUser };
