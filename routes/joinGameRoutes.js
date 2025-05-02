import express from "express";
const router = express.Router();

import { hostGameData, joinGameData } from "../data/index.js";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import { userProfileData } from "../data/index.js";
//import userProfile from '../models/userProfile.js';

router
  .get("/", async (req, res) => {
    // get http://localhost:8080/join  get all games
    try {
      let userId = null;
      let recommendation = [];
      let joinedGameIdStrings = [];
      let filters = {};
      let calendarEvents = [];
      let allGames = [];

      //if the user has logged in
      if (req.user && req.user.userId) {
        userId = req.user.userId;
        const userProfile = await userProfileData.getProfile(userId);
        const cookiecontaininglocation = req.cookies.user_location; //need to verify this

        if (userProfile) {
          if (cookiecontaininglocation) {
            const { lat, lng } = JSON.parse(cookiecontaininglocation);
            filters = {
              geoLocation: {
                $near: {
                  $geometry: { type: "Point", coordinates: [lng, lat] },
                  $maxDistance: 10000,
                },
              },
              //sport: { $in: userProfile.sportsInterests.map((a) => a.sport)},
              sport: { $in: userProfile.sportsInterests || [] },
              skillLevel: userProfile.gymPreferences?.skillLevel || "Beginner",
            };
          } else {
            filters = {
              location: userProfile.city, //need to check this
              //sport: { $in: userProfile.sportsInterests.map((a) => a.sport)},
              sport: { $in: userProfile.sportsInterests || [] },
              skillLevel: userProfile.gymPreferences?.skillLevel || "Beginner",
            };
          }
        }
        await Promise.all(allGames.map((game) => game.populate("host")));
        const now = new Date();

        // Filter out games that are already over
        const upcomingGames = allGames.filter((game) => {
          return new Date(game.endTime) > now;
        });

        const plainAllGames = upcomingGames.map((g) => g.toObject());

        // Prepare events for FullCalendar
        const joinedGameIds = await joinGameData.getJoinedGamesByUser(userId); // array of gameIds
        const joinedGames = await hostGameData.getGamesByIds(joinedGameIds); // fetch games from DB
        calendarEvents = joinedGames.map((game) => ({
          title: `${game.title} - ${game.sport}`,
          start: game.startTime,
          end: game.endTime,
          url: `/join/${game._id}`,
        }));
      }
      //if the user is not logged in
      else {
        const cookiecontaininglocation = req.cookies.user_location;
        if (cookiecontaininglocation) {
          try {
            const { lat, lng } = JSON.parse(cookiecontaininglocation);
            filters = {
              geoLocation: {
                $near: {
                  $geometry: { type: "Point", coordinates: [lng, lat] },
                  $maxDistance: 5000,
                },
              },
            };
          } catch (e) {
            console.warn("Invalid user_location cookie", e);
          }
        }
      }
      if (Object.keys(filters).length > 0) {
        console.log(
          "Filters for recommendation:",
          JSON.stringify(filters, null, 2)
        );
        recommendation = await hostGameData.getAllGames(filters);
      }

      allGames = await hostGameData.getAllGames({});

      const now = new Date();
      const upcomingGames = allGames.filter((game) => {
        return new Date(game.startTime) > now; // Only future games
      });

      upcomingGames.sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );

      // only for upcoming dates.
      const plainAllGames = upcomingGames.map((x) => x.toObject());

      const plainRecommendation =
        recommendation.length > 0
          ? upcomingGames.map((x) => x.toObject())
          : [];

      res.render("joinGame/joinGameForm", {
        recommendedGames: plainRecommendation, //.length > 0 ? plainRecommendation : plainAllGames,
        allGames: plainAllGames,
        calendarEvents,
        userId,
        hostId: req.user?.userID || null,
        joinedGameIdStrings,
        isLoggedIn: !!userId,
        title: "Join Games",
        layout: "main",
        head: `
              <link rel="stylesheet" href="/css/joinGame.css">
              <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
              <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
                `,
      });
    } catch (e) {
      res.status(500).send(e.message);
    }
  })
  .post("/", auth, async (req, res) => {
    const { gameId } = req.body;
    const userId = req.user?.userID || req.userId;

    const game = await hostGameData.getGameById(gameId);
    if (game.startTime < new Date()) {
      return res.status(400).send("Cannot join a game that's already over.");
    }

    if (!userId || !gameId) {
      return res.status(400).send("Invalid request");
    }

    try {
      await joinGameData.joinGame(gameId, userId);
      res.redirect("/join/success");
    } catch (e) {
      res.status(400).send(e.message);
    }
  });

router.get("/filter", auth, async (req, res) => {
  try {
    const { city, sport, minPlayers, maxCost, skillLevel } = req.query;
    const filters = {};

    if (city) filters.location = city;
    if (sport) filters.sport = sport;
    if (minPlayers) filters.playersRequired = { $gte: Number(minPlayers) };
    if (maxCost) filters.costPerHead = { $lte: Number(maxCost) };
    if (skillLevel) filters.skillLevel = skillLevel;

    filters.dateTime = { $gte: new Date() };

    const allGames = await hostGameData.getAllGames(filters);
    const plainAll = allGames.map((g) => g.toObject());

    res.render("joinGame/joinGameForm", {
      recommendedGames: [],
      allGames: plainAll,
      userId: req.user.userId,
      title: "Join Games",
      layout: "main",
      head: `
                  <link rel="stylesheet" href="/css/joinGame.css">
                `,
    });
  } catch (error) {
    res.status(500).send(e.message);
  }
});
router.get("/success", (req, res) => {
  res.render("joinGame/joinGameSuccess", {
    title: "Successfully Joined",
    message: "You have successfully joined the game!",
    layout: "main",
    head: `
              <link rel="stylesheet" href="/css/joinGame.css">
            `,
  });
});
router.get("/:id", async (req, res) => {
  //http://localhost:8080/join/67f970e5d5c97b58736c31be
  try {
    const gameId = req.params.id;
    const game = await hostGameData.getGameById(gameId);
    if (!game) return res.status(404).send("Game not found");

    await game.populate({ path: "host", model: "Userlist" });

    const userId = req.user?.userID || req.user?.userId;
    const isLoggedIn = !!userId;
    const isHost = isLoggedIn && game.host._id.toString() === userId;

    let joinedGameIdStrings = [];
    let hasJoined = false;
    let joinedPlayers = [];
    if (isLoggedIn) {
      const joinedGames = await joinGameData.getJoinedGamesByUser(userId);
      joinedGameIdStrings = joinedGames.map((g) => g._id.toString());
      hasJoined = joinedGameIdStrings.includes(game._id.toString());
    }

    // Fetch players joined to this game
    if (game.players && game.players.length > 0) {
      await game.populate({ path: "players", model: "Userlist" });
      joinedPlayers = game.players.map((player) => ({
        _id: player._id,
        username: player.username,
      }));
    }

    res.render("joinGame/gameDetails", {
      game: game.toObject(),
      hostId: game.host._id.toString(),
      isLoggedIn,
      userId,
      isHost,
      hasJoined,
      joinedPlayers,
      joinedGameIdStrings,
      error: req.query.error || null,
      layout: "main",
      head: `<link rel="stylesheet" href="/css/joinGame.css">`,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

router.post("/leave/:id", auth, async (req, res) => {
  const gameId = req.params.id;
  const userId = req.user.userID;

  try {
    const game = await hostGameData.getGameById(gameId);
    if (!game) return res.status(404).send("Game not found");

    // Prevent host from leaving their own game
    if (game.host.toString() === userId) {
      const isLoggedIn = true;
      const joinedGames = await joinGameData.getJoinedGamesByUser(userId);
      const joinedGameIdStrings = joinedGames.map((g) => g._id.toString());

      return res.render("joinGame/gameDetails", {
        game: game.toObject(),
        isLoggedIn,
        userId,
        joinedGameIdStrings,
        error: "Host cannot leave their own game",
        layout: "main",
        head: `<link rel="stylesheet" href="/css/joinGame.css">`,
      });
    }

    await joinGameData.leaveGame(gameId, userId);
    res.redirect("/join");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

export default router;
