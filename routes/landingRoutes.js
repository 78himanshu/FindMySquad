import express from "express";
const router = express.Router();
import { login, signup } from "../data/authUser.js";
import * as hostGameData from "../data/hostGame.js";
import { userProfileData }  from "../data/userProfile.js";


// Home route with session handling
router.get("/", async (req, res) => {
  
  try {
    console.log("landing routes entered");
    // const recentGames = await hostGameData.getRecentGames();
    // console.log("Fetched Recent Games:", JSON.stringify(recentGames, null, 2));
    const topUsers = await userProfileData.getTopKarmaUsers();
    console.log("TOP USERS FOR HOMEPAGE:", topUsers);

    res.render("index", {
      user: req.session?.user,
      isLoggedIn: !!req.session?.user,
      username: req.session?.user?.username || null,
      //recentGames: recentGames.map((g) => g.toObject?.() ?? g),
      //recentGames: recentGames,
      topUsers: topUsers,
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
