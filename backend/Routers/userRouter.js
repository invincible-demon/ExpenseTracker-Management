import express from 'express';
import { loginControllers, registerControllers, setAvatarController, sendOtpController, verifyOtpController, changePasswordController, forgotPasswordSendOtpController, forgotPasswordResetController } from '../controllers/userController.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();

router.route("/register").post(registerControllers);

router.route("/login").post(loginControllers);

router.route("/setAvatar/:id").post(setAvatarController);

router.route("/send-otp").post(sendOtpController);

router.route("/verify-otp").post(verifyOtpController);

router.route("/change-password").post(authenticateJWT, changePasswordController);

router.route("/forgot-password/send-otp").post(forgotPasswordSendOtpController);
router.route("/forgot-password/reset").post(forgotPasswordResetController);

export default router;