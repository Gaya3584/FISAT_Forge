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

exports.sendVerificationEmail = async (req, res) => {
  const { admission_no, email } = req.body;
  const user = await User.findOne({ admission_no, email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isEmailVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }
  const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification",
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  });
  return res.json({ message: "Verification email sent" });
};



exports.verifyEmailToken = async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send("User not found");
    if (user.isEmailVerified) {
      return res.redirect(`http://localhost:5173/set-password?token=${token}&status=alreadyVerified`);
    }
    user.isEmailVerified = true;
    await user.save();
    return res.redirect(`http://localhost:5173/set-password?token=${token}`);
  } catch (err) {
    return res.redirect(`http://localhost:5173/set-password?error=invalid`);
  }
};

exports.setPassword = async (req, res) => {
  const { admission_no, email, password } = req.body;
  if (!admission_no || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findOne({ admission_no, email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isEmailVerified) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    return res.json({ message: "Password set successfully" });
    redirect(`http://localhost:5173/login?status=passwordSet`);
  } else {
    return res.status(403).json({ message: "Email not verified" });
  }
}


