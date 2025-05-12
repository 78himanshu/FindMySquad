import { Router } from "express";
const router = Router();
import { authUserData } from "../data/index.js";
import { checkString } from "../utils/helper.js";
import jwt from "jsonwebtoken";
import xss from "xss";
import redirectIfLoggedIn from "../middleware/redirectIfLoggedIn.js";

router
  .route("/signup")
  .get(redirectIfLoggedIn,(req, res) => {
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
      `,
    });
  })
  .post(async (req, res) => {
    try {
      const username = xss(req.body.username).trim();
      const email = xss(req.body.email).trim();
      const password = xss(req.body.password).trim();
      const confirmPassword = xss(req.body.confirmPassword).trim();

      if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }

      console.log("==>>>>", username, email, password, confirmPassword);

      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      checkString(email, "email");
      checkString(password, "password");

      const newUser = await authUserData.signup(username, email, password);

      console.log("newUser", newUser);

      // Redirect to add profile page
      return res.status(200).json({
        message: "Signup successful",
        redirect: "/login?success=Account created successfully. Please login.",
      });
    } catch (error) {
      return res.status(400).json({ error: error.message || "Signup failed" });
    }
  });
router
  .route("/login")
  .get(redirectIfLoggedIn,(req, res) => {
    res.render("auth/login", {
      title: "Login",
      layout: "main",
      redirect: req.query.redirect || "/",
      error: req.query.error,
      redirect: req.query.redirect || "",
      head: `
        <link rel="stylesheet" href="/css/login.css">
        <link rel="stylesheet" href="/css/styles.css">

      `,
    });
  })
  .post(async (req, res) => {
    try {
      const email = xss(req.body.email).trim();
      const password = xss(req.body.password).trim();
      const redirect = xss(req.body.redirect || "").trim();

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      checkString(email, "email");
      checkString(password, "password");

      const { token, user, profilePic } = await authUserData.login(
        email,
        password
      );

      console.log("✅ Setting token cookie:", token);
      console.log("✅ Token payload:", jwt.decode(token));

      console.log(token, user, profilePic);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      });
      res.cookie(
        "user",
        JSON.stringify({
          username: user.username,
          profilePic: profilePic,
        }),
        {
          httpOnly: false,
          maxAge: 3600000,
        }
      );

      let redirectTo = redirect || "/";

      if (!user.profileCompleted) {
        redirectTo = "/profile/addprofile";
      }
      console.log(redirectTo, "test redirectTo:");
      return res.status(200).json({
        message: "Login successful",
        redirect: redirectTo,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileCompleted: user.profileCompleted,
          profilepic: user.profilePic || "/images/default-avatar.png",
        },
        // redirect: redirect || "/", // Included redirect in the response
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message || "Invalid email or password. Please try again.",
      });
    }
  });

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/?success=Logged out successfully");
});

export default router;
