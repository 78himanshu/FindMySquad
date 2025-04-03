import { Router } from "express";
const router = Router();
import { authUserData } from "../data/index.js";
import { checkString } from "../utils/Helper.js";
import jwt from "jsonwebtoken";

router
  .route("/signup")
  .get((req, res) => {
    res.render("auth/signup", {
      title: "signup",
      layout: false,
      error: req.query.error,
    });
  })
  .post(async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.redirect("/signup?error=All fields are required");
      }

      checkString(username, "username");
      checkString(email, "email");
      checkString(password, "password");

      const newUser = await authUserData.signup(username, email, password);

      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Set cookie and redirect
      res.cookie("token", token, { httpOnly: true });
      return res.redirect("/"); // Redirect to home after signup
    } catch (error) {
      return res.redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }
  });

router
  .route("/login")
  .get((req, res) => {
    res.render("auth/login", {
      title: "Login",
      layout: false,
      error: req.query.error,
    });
  })
  .post(async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.redirect("/login?error=Email and password are required");
      }

      checkString(email, "email");
      checkString(password, "password");

      const user = await authUserData.login(email, password);

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 3600000, // 1 hour
        })
        .redirect("/");
    } catch (error) {
      return res.redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
  });

// Logout route
// router.get("/logout", (req, res) => {
//   res.clearCookie("token");
//   res.redirect("/");
// });

export default router;
