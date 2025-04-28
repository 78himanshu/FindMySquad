import express from "express";
const router = express.Router();
import { login, signup } from "../data/authUser.js";
import * as hostGameData from "../data/hostGame.js";

// Home route with session handling
router.get("/", async (req, res) => {
  try {
    const recentGames = await hostGameData.getRecentGames();
    console.log("Fetched Recent Games:", JSON.stringify(recentGames, null, 2));

    res.render("index", {
      user: req.session?.user,
      isLoggedIn: !!req.session?.user,
      username: req.session?.user?.username || null,
      //recentGames: recentGames.map((g) => g.toObject?.() ?? g),
      recentGames: recentGames,
      title: "Home",
    });
  } catch (e) {
    console.error("Home page load error:", e);
    res.render("index", {
      user: null,
      recentGames: [],
      isLoggedIn: false,
      title: "Home",
    });
  }
});

// // Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

export default router;
