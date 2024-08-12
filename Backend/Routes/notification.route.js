import express from "express"
import { protectedRoute } from "../middleware/protectedRoute.js"
import { deleteNotifications, getNotifications } from "../Controllers/notification.controller.js"
const router = express.Router()

router.get("/", protectedRoute, getNotifications)
router.delete("/", protectedRoute, deleteNotifications)

export default router