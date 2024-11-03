// models/userModel.js
const db = require("../config/db");

const createUser = async (user) => {
  const queryText = `
    INSERT INTO users 
      (name, email, password, profile_image_url, phone_number, city, 
      stripe_customer_id, default_payment_method_id, account_status, date_of_birth)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [
    user.name, user.email, user.password, user.profileImageUrl, 
    user.phoneNumber, user.city, user.stripeCustomerId, 
    user.defaultPaymentMethodId, user.accountStatus || 'active', 
    user.dateOfBirth
  ];

  const { rows } = await db.query(queryText, values);
  return rows[0];
};

const getUserById = async (id) => {
  const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0];
};

const updateUser = async (id, updates) => {
  const { name, phoneNumber, city, profileImageUrl } = updates;
  const queryText = `
    UPDATE users
    SET name = $1, phone_number = $2, city = $3, profile_image_url = $4
    WHERE id = $5
    RETURNING *;
  `;
  const values = [name, phoneNumber, city, profileImageUrl, id];
  const { rows } = await db.query(queryText, values);
  return rows[0];
};

const deleteUser = async (id) => {
  const { rowCount } = await db.query("DELETE FROM users WHERE id = $1", [id]);
  return rowCount;
};

module.exports = { createUser, getUserById, updateUser, deleteUser };
