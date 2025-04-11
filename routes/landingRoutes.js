import express from "express";
const router = express.Router();
import { login, signup } from "../data/authUser.js";

// Home route with session handling
router.get("/", (req, res) => {
  res.render("index", { 
    user: req.session.user,
    //title: "Home",
    //success : req.query.success
   });
});

// // Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});        

export default router;
