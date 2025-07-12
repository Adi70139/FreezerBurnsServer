import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import crypto from "crypto";
import otpModel from "../models/otpModel.js";
import nodemailer from "nodemailer";

//create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

//login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token,email});
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

//register user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};


const verifyEmail = async (req,res)=>{
   const {email}=req.body;

   const existingUser = await userModel.findOne({email});
    if (existingUser) {
       return res.json({ success: false, message: "User already exists" });
    }
   const otp = crypto.randomInt(100000, 999999).toString();

   const expiresAt = new Date(Date.now() + 1 * 60 * 1000); 
   
    await otpModel.findOneAndUpdate(
    { email },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Your OTP: ${otp}</h2><p>It will expire in 5 minutes.</p>`,
  });

   res.json({ success: true, message: "OTP sent to email" });

}

const verifyOtp = async (req,res)=>{
     const {email,otp}= req.body;
     const otpData = await otpModel.findOne({email});
     console.log(otpData)
     if(!otpData){
       return res.json({ success:false, message: "Invalid or expired OTP"})
     }

     if (otpData.otp !== otp || otpData.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    await otpModel.deleteOne({ email });

    return res.json({ success: true, message: "OTP verified successfully" });


}

export { loginUser, registerUser, verifyEmail, verifyOtp };
