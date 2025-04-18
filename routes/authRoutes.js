import { Router } from "express";
const router = Router();
import { authUserData } from "../data/index.js";
import { checkString } from "../utils/helper.js";
import jwt from "jsonwebtoken";

router
  .route("/signup")
  .get((req, res) => {
    res.render("auth/signup", {
      title: "Sign Up",
      layout: "main",
      error: req.query.error,
      username: req.query.username || "",
      email: req.query.email || "",
      head: `
        <link rel="stylesheet" href="/css/signup.css">
        <link rel="stylesheet" href="/css/modal.css">
        <link rel="stylesheet" href="/css/styles.css">
      `
    });
  })
  .post(async (req, res) => {
    try {
      const { username, email, password, confirmPassword } = req.body;

      if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }

      console.log("==>>>>", username, email, password, confirmPassword)

      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      checkString(username, "username");
      checkString(email, "email");
      checkString(password, "password");


      const newUser = await authUserData.signup(username, email, password);

      console.log("newUser", newUser)

      // console.log("==>>", newUser)

      // if(!newUser){
      //   return
      // }

      // const token = jwt.sign(
      //   { userId: newUser._id, username: newUser.username },
      //   process.env.JWT_SECRET,
      //   { expiresIn: "1h" }
      // );

      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   maxAge: 3600000,
      // });

      return res.status(200).json({ message: "Signup successful", newUser });
    } catch (error) {
      return res.status(400).json({ error: error.message || "Signup failed" });
    }
  });

router
  .route("/login")
  .get((req, res) => {
    res.render("auth/login", {
      title: "Login",
      layout: "main",
      error: req.query.error,
      head: `
        <link rel="stylesheet" href="/css/login.css">
        <link rel="stylesheet" href="/css/styles.css">

      `
    });
  })
  .post(async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      checkString(email, "email");
      checkString(password, "password");

      const { token, user } = await authUserData.login(email, password);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      });

      const nextPage = user.profileCompleted ? "/" : "/addprofile";

      res.status(200).json({
        message: "Login successful", token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          "profileCompleted": user.profileCompleted
        },
        nextPage
      });
    } catch (error) {
      // console.error("Login error:", error);
      return res.status(400).json({ error: error.message || "Login failed" });
    }
  });

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/?success=Logged out successfully");
});

export default router;
