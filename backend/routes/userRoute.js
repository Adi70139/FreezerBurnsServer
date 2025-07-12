import express from 'express';
import { loginUser,registerUser } from '../controllers/userController.js';
import { verifyEmail, verifyOtp } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.post("/verify-email",verifyEmail);
userRouter.post("/verify-otp", verifyOtp);

export default userRouter;