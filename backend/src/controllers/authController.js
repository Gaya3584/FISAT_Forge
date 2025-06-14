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

// POST /check-admission
const checkAdmission = async (req, res) => {
  const { admission_no } = req.body;

  try {
    const user = await User.findOne({ admission_no });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password) {
      return res.status(400).json({ message: "User already registered" });
    }

    res.json({
      name: user.name,
      email: user.email,
      admission_no: user.admission_no,
      department: user.department,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /verify-email
const verifyEmail = async (req, res) => {
  const { admission_no, email } = req.body;

  try {
    const user = await User.findOne({ admission_no, email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ admission_no }, process.env.JWT_SECRET, { expiresIn: "1h" });
    user.verificationToken = token;
    await user.save();

    const link = `http://localhost:5173/set-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Set Your Password - FISAT Forge",
      html: `<p>Hello ${user.name},</p><p>Click <a href="${link}">here</a> to set your password and complete your registration.</p>`,
    });

    res.json({ message: "Verification email sent" });
  } catch (err) {
    res.status(500).json({ message: "Email sending failed" });
  }
};

// POST /set-password
const setPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ admission_no: decoded.admission_no });

    if (!user || user.verificationToken !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: "Password set successfully" });
  } catch (err) {
    res.status(400).json({ message: "Token expired or invalid" });
  }
};

// POST /login
const login = async (req, res) => {
  const { admission_no, password } = req.body;

  try {
    const user = await User.findOne({ admission_no });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.password || !user.isVerified) {
      return res.status(403).json({ message: "Please verify your email and set password first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

module.exports = {
  checkAdmission,
  verifyEmail,
  setPassword,
  login,
};
