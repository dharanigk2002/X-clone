import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export async function createPost(req, res) {
  const { user, text } = req.body;
  let { img } = req.body;
  const id = user._id.toString();
  try {
    if (!text && !img)
      return res.status(400).json({
        success: false,
        message: "Post must have either image or text",
      });
    if (img) {
      const uploadRes = await cloudinary.uploader.upload(img);
      img = uploadRes.secure_url;
    }
    const newPost = new Post({
      user: id,
      text,
      img,
    });
    await newPost.save();
    return res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deletePost(req, res) {
  try {
    const { postId } = req.params;
    const { user } = req.body;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    if (post.user.toString() !== user._id.toString())
      return res
        .status(401)
        .json({ success: false, message: "Not allowed to delete this post" });
    if (post.img) {
      await cloudinary.uploader.destroy(
        post.img.split("/").pop().split(".")[0]
      );
    }
    await Post.findByIdAndDelete(postId);
    return res
      .status(200)
      .json({ success: true, message: "Successfully deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createComment(req, res) {
  try {
    const { id } = req.params;
    const {
      user: { _id },
      text,
    } = req.body;
    if (!text)
      return res.status(400).json({ success: false, message: "Text required" });
    const post = await Post.findById(id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    const comment = {
      user: _id,
      text,
    };
    post.comments.push(comment);
    await post.save();
    return res.status(201).json({ success: true, post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function likeUnlikePost(req, res) {
  try {
    const { user } = req.body;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    if (post.likes.includes(user._id)) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: user._id } });
      await User.updateOne(
        { _id: user._id },
        { $pull: { likedPosts: postId } }
      );
      const updatedLikes = post.likes.filter(
        (like) => like.toString() !== user._id.toString()
      );
      console.log(post);
      return res.status(200).json({ message: "Post unliked", updatedLikes });
    } else {
      await Post.updateOne({ _id: postId }, { $push: { likes: user._id } });
      await User.updateOne(
        { _id: user._id },
        { $push: { likedPosts: postId } }
      );
      const notify = new Notification({
        from: user._id,
        to: post.user,
        type: "like",
      });
      await notify.save();
      post.likes.push(user._id);
      const updatedLikes = post.likes;
      return res.status(200).json({ message: "Post liked", updatedLikes });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllPosts(_, res) {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password -followers -following -bio -link -email -__v",
      });
    if (posts.length === 0)
      return res
        .status(200)
        .json({ success: true, message: "No posts created yet" });
    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getLikedPosts(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password -followers -following -bio -link -email -__v",
      });
    return res.json({ success: true, likedPosts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getFollowingPosts(req, res) {
  try {
    const { user } = req.body;
    const feedPosts = await Post.find({ user: { $in: user.following } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password -followers -following -bio -link -email -__v",
      });
    return res.status(200).json({ success: true, posts: feedPosts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUserPosts(req, res) {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password -followers -following -bio -link -email -__v",
      });
    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
