import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

export async function signup(req, res) {
  try {
    const { username, fullName, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ success: false, message: "Invalid email" });
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingUsername || existingEmail)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must have atleast 6 chars length",
      });
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPwd,
      fullName,
    });
    generateToken(newUser._id, res);
    await newUser.save();
    return res
      .status(200)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isMatch = await bcrypt.compare(password, user?.password);
    if (!user || !isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    generateToken(user._id, res);
    return res
      .status(200)
      .json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
}

export async function logout(req, res) {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function validateUser(req, res) {
  try {
    const { user } = req.body;
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
