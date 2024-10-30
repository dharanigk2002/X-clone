import express from "express";
import {
  followUnFollow,
  getProfile,
  getSuggestedUser,
  updateUser,
} from "../controllers/user.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const userRouter = express.Router();

userRouter.get("/profile/:username", protectRoute, getProfile);
userRouter.get("/follow/:id", protectRoute, followUnFollow);
userRouter.get("/suggested", protectRoute, getSuggestedUser);
userRouter.patch("/update", protectRoute, updateUser);

export default userRouter;
