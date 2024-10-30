import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export async function getProfile(req, res) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function followUnFollow(req, res) {
  try {
    const { id } = req.params;
    const { user } = req.body;
    const userToModify = await User.findById({ _id: id });
    const currentUser = await User.findById({ _id: user._id });
    if (id == user._id)
      return res.status(400).json({
        success: false,
        message: "You can't follow/unfollow yourself",
      });
    if (!userToModify)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (currentUser.following.includes(id)) {
      await User.findByIdAndUpdate(id, { $pull: { followers: user._id } });
      await User.findByIdAndUpdate(user._id, { $pull: { following: id } });
      return res
        .status(200)
        .json({ success: true, message: "Successfully unfollowed" });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: user._id } });
      await User.findByIdAndUpdate(user._id, { $push: { following: id } });
      const newNotification = new Notification({
        type: "follow",
        from: user._id,
        to: userToModify._id,
      });
      await newNotification.save();
      return res
        .status(200)
        .json({ success: true, message: "Successfully followed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSuggestedUser(req, res) {
  try {
    const { user } = req.body;
    const suggestUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: user._id },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);
    const filteredUsers = suggestUsers
      .filter((sug) => !user.following.includes(sug._id))
      .slice(0, 4);
    return res
      .status(200)
      .json({ success: true, suggestedUser: filteredUsers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateUser(req, res) {
  const { user } = req.body;
  const currentUser = await User.findById({ _id: user._id });
  let {
    username,
    fullName,
    email,
    currentPassword,
    bio,
    link,
    newPassword,
    profileImg = "",
    coverImg = "",
  } = req.body;
  try {
    if ((!newPassword && currentPassword) || (!currentPassword && newPassword))
      return res.status(400).json({
        success: false,
        message: "Please provide both current and new password",
      });
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );
      if (!isValidPassword)
        return res
          .status(403)
          .json({ success: false, message: "Current password is incorrect" });
      if (newPassword.length < 6)
        return res.status(400).json({
          success: false,
          message: "Password must be atleast 6 chars length",
        });
      const salt = await bcrypt.genSalt(10);
      const hashPwd = await bcrypt.hash(newPassword, salt);
      user.password = hashPwd;
    }
    if (profileImg) {
      if (currentUser.profileImg) {
        await cloudinary.uploader.destroy(
          currentUser.profileImg.split("/").pop().split(".")[0]
        );
      }
      const profileImgUpload = await cloudinary.uploader.upload(profileImg);
      profileImg = profileImgUpload.secure_url;
    }

    if (coverImg) {
      if (currentUser.coverImg) {
        await cloudinary.uploader.destroy(
          currentUser.coverImg.split("/").pop().split(".")[0]
        );
      }
      const coverImgUpload = await cloudinary.uploader.upload(coverImg);
      coverImg = coverImgUpload.secure_url;
    }
    user.username = username || currentUser.username;
    user.fullName = fullName || currentUser.fullName;
    user.email = email || currentUser.email;
    user.bio = bio;
    user.link = link;
    user.profileImg = profileImg || currentUser.profileImg;
    user.coverImg = coverImg || currentUser.coverImg;

    const update = await User.findByIdAndUpdate({ _id: user._id }, user).select(
      "-password"
    );
    return res.status(200).json({ success: true, user: update });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
