import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"

export const getNotifications = async (req, res) => {
    try {
        const myId = req.user._id
        const user = await User.findById(myId)
        if (!user) {
            return res.status(404).json({ error: `user not found` })
        }
        const notifications = await Notification.find({ to: myId }).sort({ createdAt: -1 }).populate({
            path: "from",
            select: "username profileImg"
        })

        await Notification.updateMany({ to: myId }, { read: true })

        res.status(200).json(notifications)
    } catch (error) {
        console.log(`Error at getNotifications : ${error}`)
        res.status(500).json({ error: `Internal Server Error` })
    }
}
export const deleteNotifications = async (req, res) => {
    try {
        const myId = req.user._id
        await Notification.deleteMany({ to: myId })

        res.status(200).json({ message: `Notifications are deleted ` })

    } catch (error) {
        console.log(`Error at deleteNotification : ${error}`)
        res.status(500).json({ error: `Internal Server Error` })
    }
}