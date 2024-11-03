// routes/userRoutes.js
const express = require("express");
const { registerUser, getUser, updateUserDetails, deleteUserAccount } = require("../controllers/userController");

const router = express.Router();

router.post("/", registerUser);
router.get("/:id", getUser);
router.put("/:id", updateUserDetails);
router.delete("/:id", deleteUserAccount);

module.exports = router;
