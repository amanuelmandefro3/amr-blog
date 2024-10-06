const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { z } = require("zod");

const {
  generateAccessTokenAndRefreshToken,
} = require("../utils/generateAccessTokenAndRefreshToken");

const emailerTransporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD, 
  },
});

const userSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate the user input
    userSchema.parse({ name, email, password });
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        msg: "User already exists.",
      });
    }

    // Create a new user object
    user = new User({
      name,
      email,
      password,
    });


    const emailToken = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const verificationUrl = `http://localhost:3000/verify-email?token=${emailToken}`;

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Verify Your Email",
      html: `Please click the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`,
    };

    await emailerTransporter.sendMail(mailOptions);
    user.verificationToken = emailToken;
    await user.save();
    // Respond to the client after successful registration

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken -verificationToken"
    );
    if (!createdUser) {
      return res.status(500).json({ msg: "Something went wrong" });
    }

    return res.status(201).json({
      msg: "User registered successfully. Please check your email to verify your account.",
      user: createdUser,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check if the user is verified
    if (!user.verified) {
      return res
        .status(400)
        .json({ msg: "Please verify your email to log in" });
    }

    // Compare provided password with the one in the DB
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create and sign a JWT token
    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken -verificationToken"
    );
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        msg: "Logged in successfully",
        user: loggedInUser,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query; // Assuming the token is passed in the query parameters

  if (!token) {
    return res.status(400).json({ msg: "Verification token is missing" });
  }

  try {
    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // This will throw an error if token is expired or invalid

    // Find the user with the token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ msg: "Invalid token" });
    }

    // If the user is already verified
    if (user.verified) {
      return res.status(400).json({ msg: "User already verified" });
    }

    // Mark the user as verified
    user.verified = true;

    // Remove the verificationToken after successful verification
    user.verificationToken = undefined;

    // Save the updated user
    await user.save();

    // Send success response
    return res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ msg: "Verification token has expired" });
    }

    return res.status(500).json({ msg: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    console.log(req.user);
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { refreshToken: undefined },
      },
      { new: true }
    );
    options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ user: {}, msg: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ msg: "No user found" });
    }
    if (user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ msg: "Invalid token" });
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ accessToken, refreshToken, msg: "Token refreshed successfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const forgetPasswordToken = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetPasswordUrl = `http://localhost:3000/reset-password?token=${forgetPasswordToken}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Reset Your Password",
      html: `Please click the following link to reset your password: <a href="${resetPasswordUrl}">${resetPasswordUrl}</a> <p>This link will expired after 15 minutes</p>` ,
    };

    await emailerTransporter.sendMail(mailOptions);
    user.forgetPasswordToken = forgetPasswordToken;
    await user.save();

    return res.status(200).json({ msg: "Reset password link sent to your email" });

  } catch (error) {
    console.error(error.message);
    res.status(500).send({msg: error.message});
  }
}

exports.resetPassword = async (req, res) => {
  const token = req.query.token;
  const { password } = req.body;
  if(!token){
    return res.status(400).json({msg: 'Token is missing'})
  }
  if(!password){
    return res.status(400).json({msg: 'Password is required'})
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({forgetPasswordToken: token});
    if(!user){
      return res.status(400).json({msg: 'User not found'})
    }
    user.password = password;
    user.forgetPasswordToken = undefined;
    await user.save();
    return res.status(200).json({msg: 'Password reset successfully'})


  } catch (error) {
    return res.status(500).json({msg: error.message})
  }
}

// change password controller
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if(!oldPassword || !newPassword){
    return res.status(400).json({msg: 'Old password and new password are required'})
  }
  try {
    const user = await User.findById(req.user._id);
    if(!user){
      return res.status(404).json({msg: 'User not found'})
    }
    const isMatch = await user.isPasswordCorrect(oldPassword);
    if(!isMatch){
      return res.status(400).json({msg: 'Invalid old password'})
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({msg: 'Password changed successfully'})
  } catch (error) {
    return res.status(500).json({msg: error.message})
  }
}
