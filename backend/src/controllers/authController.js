const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.findByAdmissionNumber = async (req, res) => {
  const { admission_no } = req.body;
  const user = await User.findOne({ admission_no });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({
    name: user.name,
    email: user.email,
    admission_no: user.admission_no, // Return as admissionNumber for consistency
    role: user.role,
    department: user.department,
    year_of_graduation: user.year_of_graduation
  });
};

exports.verifyEmailAndSetPassword = async (req, res) => {
  const { admission_no, email, password } = req.body;
  const user = await User.findOne({ admission_no, email });
  if (!user) return res.status(404).json({ message: "User not found" });
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.isEmailVerified = true;
  await user.save();

  // Send confirmation email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verification Successful",
    text: "Your account has been verified successfully.",
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return res.json({ token });
};
