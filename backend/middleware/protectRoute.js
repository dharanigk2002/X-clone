import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export default async function protectRoute(req, res, next) {
  try {
    const token = req.cookies.jwt;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorised. No token found" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId }, { password: 0 });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    req.body.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
