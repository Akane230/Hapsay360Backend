import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Generate JWT
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  );

// Email validation
const validateEmail = (email) => /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email);

// REGISTER
export const register = async (req, res) => {
  try {
    const { email, password, role = "user" } = req.body;

    // Validation
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    if (!validateEmail(email))
      return res.status(400).json({ message: "Invalid email format" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Create user with minimal info
    const user = new User({
      email,
      password,
      role,
      personal_info: {}, // optional
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        personal_info: user.personal_info,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000)
      return res
        .status(400)
        .json({ message: "Duplicate field", error: error.message });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.status === "Suspended")
      return res.status(403).json({ message: "Account suspended" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        personal_info: user.personal_info,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
