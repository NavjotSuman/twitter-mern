import express from "express"
import { protectedRoute } from "../middleware/protectedRoute.js"
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUserProfile } from "../Controllers/user.controller.js"
const router = express.Router()

router.get("/profile/:username", protectedRoute, getUserProfile)
router.post("/follow/:id", protectedRoute, followUnfollowUser)
router.get("/suggested", protectedRoute, getSuggestedUsers)
router.put("/update", protectedRoute, updateUserProfile)

export default router