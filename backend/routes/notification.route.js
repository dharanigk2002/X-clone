import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  deleteNotifications,
  getNotifications,
} from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/", protectRoute, getNotifications);
notificationRouter.delete("/", protectRoute, deleteNotifications);

export default notificationRouter;
