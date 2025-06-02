const express = require("express");
const router = express.Router();
const {
  findByAdmissionNumber,
  verifyEmailAndSetPassword,
} = require("../controllers/authController");

// Changed to POST since we're sending data in request body
router.post("/check-admission", findByAdmissionNumber);
router.post("/verify-email", verifyEmailAndSetPassword);

module.exports = router;