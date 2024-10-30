import express from "express";
import {
  login,
  logout,
  signup,
  validateUser,
} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/valid", protectRoute, validateUser);

export default authRouter;
