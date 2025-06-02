const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  admission_no: { type: String, unique: true }, 
  name: String,
  email: { type: String, unique: true },
  role: String,
  year_of_graduation: { type: Number }, 
  phone: {type:Number, unique: true},
  department: String,
  isEmailVerified: { type: Boolean, default: false },
  password: String,
});
module.exports = mongoose.model("User", UserSchema, "student/alumni");