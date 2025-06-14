const express = require("express");
const router = express.Router();
const {
  checkAdmission,
  verifyEmail,
  setPassword,
  login,
} = require("../controllers/authController");

// Route to check admission number and return user details
router.post("/check-admission", checkAdmission);

// Route to send email verification
router.post("/verify-email", verifyEmail);

// Route to set password after email verification
router.post("/set-password", setPassword);

// Route to log in
router.post("/login", login);

module.exports = router;
