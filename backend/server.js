import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/auth.route.js";
import connectDB from "./db/connectDb.js";
import morgan from "morgan";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import notificationRouter from "./routes/notification.route.js";

const app = express();

const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  express.json({
    limit: "5mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/notifications", notificationRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));
  app.get("*", (_, res) =>
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"))
  );
}

app.listen(PORT, () => {
  console.log("Server listening on port ", PORT);
  connectDB();
});
