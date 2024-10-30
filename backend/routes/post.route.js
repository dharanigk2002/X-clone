import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createComment,
  createPost,
  deletePost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
} from "../controllers/post.controller.js";

const postRouter = express.Router();

postRouter.get("/all", protectRoute, getAllPosts);
postRouter.get("/likes/:id", protectRoute, getLikedPosts);
postRouter.get("/following", protectRoute, getFollowingPosts);
postRouter.get("/user/:username", protectRoute, getUserPosts);
postRouter.post("/create", protectRoute, createPost);
postRouter.post("/like/:id", protectRoute, likeUnlikePost);
postRouter.post("/comment/:id", protectRoute, createComment);
postRouter.delete("/:postId", protectRoute, deletePost);

export default postRouter;
