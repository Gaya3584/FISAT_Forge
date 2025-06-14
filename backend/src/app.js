const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes); // ✅ Important
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

module.exports = app; // ✅ Export only the app (no server.listen here)
