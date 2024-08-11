import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User Not Found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.log(`Error at getUserProfie : ${error}`);
        res.status(500).json({ error: error.message });
    }
};

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userToModify = await User.findById(id).select("-password");
        const currentUser = await User.findById(req.user._id).select("-password");

        if (id === req.user._id.toString()) {
            return res
                .status(400)
                .json({ error: "You can't Follow/Unfollow yourself" });
        }

        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User Not Found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // to Unfollow the given User
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });

            // remove from notification if unfollowed and is
            const isNotificationReaded = await Notification.deleteMany({
                $and: [{ from: req.user._id }, { to: id }, { type: "follow" }],
            });

            res.status(200).json({ message: `User Unfollowed Successfully` });
        } else {
            // to Follow the Given User
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });

            // notification: for someone followed you
            const newNotification = new Notification({
                from: req.user._id,
                to: id,
                type: "follow",
            });

            await newNotification.save();

            res.status(200).json({ message: `User Followed Successfully` });
        }
    } catch (error) {
        console.log(`Error at followUnfollowUser : ${error}`);
        res.status(500).json({ error: error.message });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        const myId = req.user._id;
        const usersFollowedByMe = await User.findById(myId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: myId },
                },
            },
            {
                $sample: { size: 10 },
            },
        ]);

        const filteredUsers = users.filter(
            (user) => !usersFollowedByMe.following.includes(user._id)
        );
        const suggestedUser = filteredUsers.slice(0, 4);
        res.send(suggestedUser);
    } catch (error) {
        console.log(`Error at getSuggestedUSer : ${error}`);
        res.status(500).json({ error: error.message });
    }
};


export const updateUserProfile = async (req, res) => {
    try {
        const myId = req.user._id
        let user = await User.findById(myId)

        const { username, fullName, currentPassword, newPassword, bio, link, email } = req.body;
        console.log(fullName)
        let { profileImg, coverImg } = req.body

        if (!user) {
            return res.status(404).json({ error: `User Not Found` })
        }


        if (!newPassword && currentPassword || newPassword && !currentPassword) {
            return res.status(400).json({ error: `Please Provide both current and new Passwords` })
        }

        if (newPassword && currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if (!isMatch) {
                return res.status(400).json({ error: `Incorrect Current Password` })
            }
            if (newPassword.length < 8) {
                return res.status(400).json({ error: `Password Must Be At least 8 Characters Long` })
            }

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword, salt)
        }

        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url
        }
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url

        }

        user.fullName = fullName || user.fullName
        user.username = username || user.username
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        // user.profileImg = profileImg || user.profileImg
        // user.coverImg = coverImg || user.coverImg

        user = await user.save()

        user.password = null
        // console.log(user)
        res.status(200).json(user)

    } catch (error) {
        console.log(`Error at updateUserProfile : ${error}`);
        res.status(500).json({ error: error.message });
    }
}