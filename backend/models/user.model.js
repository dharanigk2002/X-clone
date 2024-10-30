import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: [true, "Username exists already"],
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: [true, "Email id already exists"],
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "Password must be atleast 6 chars length"],
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
