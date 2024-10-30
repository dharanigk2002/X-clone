import Notification from "../models/notification.model.js";

export async function getNotifications(req, res) {
  try {
    const { user } = req.body;
    const notification = await Notification.find({ to: user._id }).populate({
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: user._id }, { $set: { read: true } });
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteNotifications(req, res) {
  try {
    const {
      user: { _id: to },
    } = req.body;
    await Notification.deleteMany({ to });
    return res
      .status(200)
      .json({ success: true, message: "Notifications deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
