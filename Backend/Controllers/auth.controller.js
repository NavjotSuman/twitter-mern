import bcrypt from "bcryptjs"


// imported own file
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";




//  ====================== SINGUP: ===================================
export const signup = async (req, res) => {
  // console.log(req.body)
  try {
    const { fullName, username, email, password } = req.body;

    // check whether the email exists in databse or not
    const emailRegex = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid Email Format" });
    }

    const isExistingEmail = await User.findOne({ email })
    if (isExistingEmail) {
      return res.status(400).json({ error: "Email Already Existed" })
    }


    // check whether the username exists in databse or not
    const isExistingUsername = await User.findOne({ username })  // User.findone() takes object as argument
    if (isExistingUsername) {
      return res.status(400).json({ error: "Username is Already Taken by someone" })
    }


    if (password.length < 8) {
      return res.status(400).json({ error: "password can't be less than 8 characters" })
    }


    // hasing the password with salt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    })

    if (newUser) {
      console.log(`checking the newUSer object id (comment it) : ${newUser._id}`)

      generateTokenAndSetCookie(newUser._id, res)
      newUser.save()

      res.status(201).json({
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg
      })

    } else {
      res.status(400).json({ error: "Invalid User data" })
    }


  } catch (error) {
    console.log(`Error at Singup Controller : ${error.message}`)
    res.status(500).json({ error: "Internal Server Error" })
  }
};



//  ======================= LOGIN: =====================================
export const login = async (req, res, next) => {
  // console.log(req.body)
  try {
    const { username, password } = req.body;

    // check whether the username exists in databse or not
    const user = await User.findOne({ username })  // User.findone() takes object as argument
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")




    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid Username or Password" })
    }

    generateTokenAndSetCookie(user._id, res)

    res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg
    })




  } catch (error) {
    console.log(`Error at Login Controller : ${error.message}`)
    res.status(500).json({ error: "Internal Server Error" })
  }
};



// ======================== LOGOUT: ====================================
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 })
    res.status(200).json({ message: "Logged out Successfully" })
  } catch (error) {
    console.log(`Error at Logout Controller : ${error.message}`)
    res.status(500).json({ error: "Internal Server Error" })
  }
};




// ========================= GetMe: =====================================
export const getMe = async (req, res) => {
  try {
    // req.user is a comming from the protected route, which is use on this route
    const user = await User.findOne(req.user._id).select("-password")
    res.status(200).json(user)
  } catch (error) {
    console.log(`Error at GetME : ${error.message}`)
    res.status(500).json({ error: "Internal Server Error" })
  }
}