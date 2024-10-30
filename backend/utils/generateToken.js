import jwt from "jsonwebtoken";

export function generateToken(userId, res) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "strict", // CSRF attacks
    httpOnly: true, // xss attacks
    secure: process.env.NODE_ENV !== "development",
  });
}
