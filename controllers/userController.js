import User from "../models/User.js";
import jwt from "jsonwebtoken";

// JWT token oluşturma fonksiyonu
const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// Yeni kullanıcı kaydı
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Zorunlu alan kontrolü
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Yeni user instance oluştur
    const user = new User({ username, email, password });
    await user.save();

    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token: createToken(user._id),
    });
  } catch (error) {
    // Duplicate key hatası (kullanıcı adı veya email mevcut)
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res
        .status(400)
        .json({ message: `${duplicateField} already exists` });
    }

    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Kullanıcı giriş işlemi
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      token: createToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
