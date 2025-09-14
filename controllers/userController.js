import User from "../models/User.js";
import jwt from "jsonwebtoken";

// JWT token oluştur
const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// Yeni kullanıcı oluşturma
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // User instance oluştur ve save ile pre-save hook çalışsın
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token: createToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Kayıtlı kullanıcı giriş yapma
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        token: createToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
