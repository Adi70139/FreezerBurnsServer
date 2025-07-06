// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/oauth2/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let user = await userModel.findOne({ email });

        if (!user) {
          user = await userModel.create({
            name,
            email,
            password: "google-oauth", 
          });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const userPayload = { email: user.email, token };
        done(null, userPayload);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// store user in session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
