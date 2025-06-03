const express = require("express");
const router = express.Router();
const {
  findByAdmissionNumber,
  verifyEmailToken,
  sendVerificationEmail,
  setPassword,
} = require("../controllers/authController");

// Changed to POST since we're sending data in request body
router.post("/check-admission", findByAdmissionNumber);
router.post("/verify-email", sendVerificationEmail);
router.get("/verify-email", verifyEmailToken);
router.post("/set-password", setPassword);


module.exports = router;