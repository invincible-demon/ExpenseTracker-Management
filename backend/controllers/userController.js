import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import OtpVerification from "../models/OtpVerification.js";

// Register Controller
export const registerControllers = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter all fields",
            });
        }

        // Check OTP verification
        const otpDoc = await OtpVerification.findOne({ email });
        if (!otpDoc || !otpDoc.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email with OTP before registering.",
            });
        }

        let user = await User.findOne({ email });

        if (user) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Remove OTP doc after successful registration
        await OtpVerification.deleteOne({ email });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        const { password: pwd, ...userData } = newUser._doc;

        return res.status(200).json({
            success: true,
            message: "User created successfully",
            user: userData,
            token,
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// Login Controller
export const loginControllers = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter all fields",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password",
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        const { password: pwd, ...userData } = user._doc;

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            user: userData,
            token,
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// Set Avatar Controller
export const setAvatarController = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const imageData = req.body.image;

        if (!imageData) {
            return res.status(400).json({ message: "No image data provided" });
        }

        const userData = await User.findByIdAndUpdate(
            userId,
            {
                isAvatarImageSet: true,
                avatarImage: imageData,
            },
            { new: true }
        );

        return res.status(200).json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
        });

    } catch (err) {
        next(err);
    }
};

// Get All Users
export const allUsers = async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.params.id } }).select([
            "email",
            "name",
            "avatarImage",
            "_id",
        ]);

        return res.json(users);
    } catch (err) {
        next(err);
    }
};

// Send OTP Controller
export const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received OTP request for email:', email);
        if (!email) {
            console.log('No email provided');
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        console.log('Generated OTP:', otp, 'Expiry:', otpExpiry);

        // Store OTP in OtpVerification collection
        let otpDoc = await OtpVerification.findOne({ email });
        if (!otpDoc) {
            otpDoc = new OtpVerification({ email, otp, otpExpiry, isVerified: false });
        } else {
            otpDoc.otp = otp;
            otpDoc.otpExpiry = otpExpiry;
            otpDoc.isVerified = false;
        }
        await otpDoc.save();
        console.log('OTP doc saved');

        // Send OTP email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        console.log('Nodemailer transporter created');
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Expense Tracker Registration',
            text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
        });
        console.log('OTP email sent successfully');
        return res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (err) {
        console.error("OTP send error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP",
            error: err.message,
        });
    }
};

// Verify OTP Controller
export const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }
        const otpDoc = await OtpVerification.findOne({ email });
        if (!otpDoc) {
            return res.status(400).json({ success: false, message: "OTP not found. Please request a new one." });
        }
        if (otpDoc.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
        if (otpDoc.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
        }
        otpDoc.isVerified = true;
        await otpDoc.save();
        return res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (err) {
        console.error('Error in verifyOtpController:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const changePasswordController = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id; // assuming JWT middleware sets req.user

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Old password is incorrect" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const forgotPasswordSendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        let otpDoc = await OtpVerification.findOne({ email });
        if (!otpDoc) {
            otpDoc = new OtpVerification({ email, otp, otpExpiry, isVerified: false });
        } else {
            otpDoc.otp = otp;
            otpDoc.otpExpiry = otpExpiry;
            otpDoc.isVerified = false;
        }
        await otpDoc.save();
        // Send OTP email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Password Reset',
            text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
        });
        return res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const forgotPasswordResetController = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: "All fields are required" });
        const otpDoc = await OtpVerification.findOne({ email });
        if (!otpDoc) return res.status(400).json({ success: false, message: "OTP not found. Please request a new one." });
        if (otpDoc.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
        if (otpDoc.otpExpiry < new Date()) return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
        // Update password
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        otpDoc.isVerified = true;
        await otpDoc.save();
        return res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
