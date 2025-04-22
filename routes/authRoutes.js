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
      `,
    });
  })
  .post(async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      checkString(email, "email");
      checkString(password, "password");

      const newUser = await authUserData.signup(username, email, password);

      // const token = jwt.sign(
      //   {
      //     userId: newUser._id,
      //     username: newUser.username,
      //   },
      //   process.env.JWT_SECRET,
      //   { expiresIn: "1h" }
      // );

      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   maxAge: 3600000,
      //   sameSite: "lax",
      // });

      res.status(200).json({
        message: "Signup successful",
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
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
      redirect: req.query.redirect || "/",
      error: req.query.error,
      redirect: req.query.redirect || "/",
      head: `
        <link rel="stylesheet" href="/css/login.css">
        <link rel="stylesheet" href="/css/styles.css">
      `,
    });
  })
  .post(async (req, res) => {
    try {
      const { email, password, redirect } = req.body; // <-- added for redirect
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      checkString(email, "email");
      checkString(password, "password");

      const { token, user } = await authUserData.login(email, password);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "lax",
      });

      const redirectTo = req.body.redirect || "/";
      //return res.status(200).json({ redirectTo });
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        redirect: redirect || "/", // Included redirect in the response
      });
    } catch (error) {
      return res.status(400).json({ error: error.message || "Login failed" });
    }
  });

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/?success=Logged out successfully");
});

export default router;
