import express  from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import "./config/passport.js" 
import passport from "passport"
import session from "cookie-session"

// app config
const app = express()
const port = 4000
app.set("trust proxy", 1);


// middlewares
app.use(express.json())
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,  
}))

app.use(
  session({
    name: "session",
    keys: ["secretKey"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// OAuth2 routes
app.get("/oauth2/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/oauth2/google/callback",passport.authenticate("google", {
       failureRedirect: "/",
       session: false,
  }),
  (req, res) => {
    // redirect to React with token and email
    const { token, email } = req.user;

    res.cookie("oauthToken",token,{
      httpOnly: false,
      secure: true,
      sameSite:"None",
      maxAge: 4*60*1000
    })

    res.cookie("oauthEmail",email,{
      httpOnly: false,
      secure: true,
      sameSite:"None",
      maxAge: 2*60*1000
    })
      res.redirect(`${process.env.CLIENT_URL}`);
    //res.redirect("http://localhost:5173/oauth-success");
  }
);

// db connection
connectDB()

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order",orderRouter)

app.get("/", (req, res) => {
    res.send("API Working")
  });

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))