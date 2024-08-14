import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

// create a post 
export const createPost = async (req, res) => {
    try {
        let { text, img } = req.body;
        const myId = req.user._id;
        const user = await User.findById(myId);

        if (!user) {
            return res.status(404).json({ error: `User Not Found` });
        }

        if (!text && !img) {
            return res.status(400).json({ error: "You must pass img or text" });
        }

        if (img) {
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.url;
        }

        const newPost = new Post({
            user: myId,
            text,
            img,
        });

        await newPost.save();

        res.status(201).json(newPost);
    } catch (error) {
        console.log(`Error at createPost : ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

// delete a post by passing its id
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: `Post Not Found` });
        }

        if (req.user._id.toString() !== post.user.toString()) {
            return res
                .status(404)
                .json({ error: `you are not the owner of this post` });
        }

        if (post.img) {
            // delete from cloudinary
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: `Post deleted successfully` });
    } catch (error) {
        console.log(`Error at createPost : ${error}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

// send comment-text on a post/tweet by passing its id 
export const commentOnPost = async (req, res) => {
    try {
        const myId = req.user._id;
        const postId = req.params.id;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: `Text is required for Comment` });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json(`Post Not Found`);
        }

        const comment = { user: myId, text };

        post.comment.push(comment);

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.log(`Error at createPost : ${error}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

// like or unlike a post by passing the id the post
export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const myId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: `Post not Found` });
        }

        const isLiked = post.likes.includes(myId);
        if (isLiked) {
            // to unlike the post
            await Post.updateOne({ _id: postId }, { $pull: { likes: myId } });
            await User.updateOne({ _id: myId }, { $pull: { likedPosts: postId } });
            res.status(200).json({ message: "Unliked the Post" });

            // remove from notification if unfollowed and is
            await Notification.deleteMany({
                $and: [{ from: req.user._id }, { to: post.user }, { type: "like" }],
            });
        } else {
            // to like the post
            post.likes.push(myId);
            await User.updateOne({ _id: myId }, { $push: { likedPosts: postId } });
            await post.save();

            // notification for like the post
            const newNotfication = new Notification({
                from: myId,
                to: post.user,
                type: "like",
            });
            await newNotfication.save();
            res.status(200).json({ message: `Liked the Post successFully` });
        }
    } catch (error) {
        console.log(`Error at likeunlikePost : ${error}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

// get all post 
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comment.user",
                select: "-password",
            });

        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log(`Error at getAllPosts : ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

// get liked post of a user by passing his _id
export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: `User Not Found` });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comment.user",
                select: "-password",
            });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log(`Errro at getLikedPosts : ${error.message}`);
        res.status(500).json({ InternalServerError });
    }
};

// posts of the user that I Following
export const getFollowingPosts = async (req, res) => {
    try {
        const myId = req.user._id;
        const user = await User.findById(myId);

        if (!user) {
            return res.status(200).json({ error: `User Not Found` });
        }

        const feedPosts = await Post.find({ user: { $in: user.following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comment.user",
                select: "-password",
            });

        res.status(200).json(feedPosts);
    } catch (error) {
        console.log(`Error at getFollowingPosts : ${error}`);
        res.status(500).json({ error: error.message });
    }
};

// get posts by passing username
export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: `User Not Found` });
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comment.user",
                select: "-password",
            });

        res.status(200).json(posts);
    } catch (error) {
        console.log(`Error at getUserPosts : ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
