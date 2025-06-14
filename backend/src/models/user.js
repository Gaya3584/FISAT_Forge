const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  admission_no: String,
  department: String,
  year_of_graduation: Number,
  phone: String,
  role: String,
  password: String,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
});

module.exports = mongoose.model("User", userSchema);
