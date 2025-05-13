import express from "express";
const router = express.Router();
import hostGamesRoutes from "./hostGamesRoutes.js";
import joinGameRoutes from "./joinGameRoutes.js";
import authRoutes from "./authRoutes.js";
import userProfileRoutes from "./userProfileRoutes.js";
import gymBuddyRoutes from "./gymBuddyRoutes.js";
import tournamentRoutes from "./tournamentRoutes.js";
import { hostGameData, gymBuddyData, userProfileData } from "../data/index.js";
import { parse, format } from "date-fns";

const configRoutesFunction = (app) => {
  // Base route - simplified since we're using middleware
  app.get("/", async (req, res) => {
    let profileCompleted = false;

    if (req.user && req.user.userId) {
      try {
        const userProfile = await userProfileData.getProfile(req.user.userId);
        profileCompleted = userProfile?.profileCompleted || false;
      } catch (e) {
        console.error("Error fetching profile in homepage route:", e);
      }
    }

    const topUsers = await userProfileData.getTopKarmaUsers();
    const upcomingGames = await hostGameData.getUpcomingGames();
    // console.log("upcomingGames", upcomingGames);
    const upcomingGymSessions = await gymBuddyData.getUpcomingSessions();
    // console.log("upcomingGymSessions", upcomingGymSessions);

    function formatTime(timeStr) {
      let [h, m] = timeStr.split(":");
      h = +h;
      const suffix = h >= 12 ? "PM" : "AM";
      const h12 = ((h + 11) % 12) + 1;
      return `${h12}:${m} ${suffix}`;
    }
    const formattedGymSessions = upcomingGymSessions.map((s) => ({
      ...s,
      formattedStartTime: formatTime(s.startTime),
      formattedEndTime: formatTime(s.endTime),
    }));

    // console.log("formattedGymSessions", formattedGymSessions)

    res.render("index", {
      title: "FindMySquad",
      user: req.user || null,
      layout: "main",
      upcomingGames: upcomingGames,
      topUsers: topUsers,
      upcomingGymSessions: formattedGymSessions,
      profileCompleted,

    });
  });

  app.get("/gamification", (req, res) => {
    res.render("gamification", {
      title: "How Gamification Works",
      layout: "main",
      currentYear: new Date().getFullYear()
    });
  });
  // Auth routes
  app.use("/", authRoutes);

  // Host games routes
  app.use("/host", hostGamesRoutes);
  app.use("/tournaments", tournamentRoutes);
  app.use("/gymBuddy", gymBuddyRoutes);
  //Join game routes
  app.use("/join", joinGameRoutes);

  app.use("/profile", userProfileRoutes);
};

export default configRoutesFunction;
