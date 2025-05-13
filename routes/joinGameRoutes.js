import express from "express";
const router = express.Router();

import { hostGameData, joinGameData } from "../data/index.js";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import { userProfileData } from "../data/index.js";
import { sendGameEmail } from "../utils/emailHelper.js";
import Reminder from "../models/Reminder.js";
import { scheduleJobFromReminder } from "../emailScheduler.js";
import { DateTime } from 'luxon';
import { hasTimeConflict } from '../utils/calendar.js';

router
  .get("/", async (req, res) => {
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
        const cookiecontaininglocation = req.cookies.user_location;

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
              sport: { $in: userProfile.sportsInterests || [] },
            };
          } else {
            filters = {
              location: userProfile.city, //need to check this
              sport: { $in: userProfile.sportsInterests || [] },
              skillLevel: userProfile.gymPreferences?.skillLevel || "Beginner",
            };
          }
        }
        await Promise.all(allGames.map((game) => game.populate("host")));
        const now = new Date();
        const upcomingGames = [];

        for (const game of allGames) {
          const gameEndTime = new Date(game.endTime);

          if (gameEndTime > now) {
            // Still an upcoming game
            upcomingGames.push(game);
          } else {
            // Game is over — check for karma penalty
            const hasPlayers = game.players && game.players.length > 0;
            const hostId = game.host.toString();
            const onlyHost =
              !hasPlayers || game.players.every((p) => p.toString() === hostId);

            if (onlyHost) {
              // No players joined apart from host — apply -15 karma
              try {
                const { updateKarmaPoints } = await import(
                  "../helpers/karmaHelper.js"
                );
                await updateKarmaPoints(hostId, -15);
              } catch (err) {
                console.error(
                  "Failed to apply karma penalty for unplayed game:",
                  err
                );
              }
            }
          }
        }

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

      const now = Date.now();
      allGames = await hostGameData.getAllGames({});
      allGames = allGames.filter(
        (game) => new Date(game.endTime).getTime() > now
      );

      const upcomingGames = allGames;

      upcomingGames.sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );

      // only for upcoming dates.
      const plainAllGames = upcomingGames.map((x) => x.toObject());

      const plainRecommendation = recommendation
        .filter((g) => new Date(g.endTime).getTime() > now)
        .map((x) => x.toObject());

      res.render("joinGame/joinGameForm", {
        recommendedGames: plainRecommendation, //.length > 0 ? plainRecommendation : plainAllGames,
        allGames: plainAllGames,
        calendarEvents,
        userId,
        hostId: req.user?.userID || null,
        error: req.query.error || null,
        joinedGameIdStrings,
        isLoggedIn: !!userId,
        title: "Join Games",
        layout: "main",
        profileCompleted: req.user?.profileCompleted || false,
        head: `
              <link rel="stylesheet" href="/css/joinGame.css">
              <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css">
              <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
                `,
      });
    } catch (e) {
      res.status(500).send(e.message);
    }
  })
  .post("/", auth, async (req, res) => {
    try {
      //const { gameId } = req.body;
      const gameId = req.body.gameId?.trim();
      const userId = req.user?.userID || req.userId;

      if (!gameId) {
        return res.redirect('/join?error=No game specified');
      }

      const targetGame = await hostGameData.getGameById(gameId);
      if (!targetGame) {
        return res.redirect(`/join/${gameId}?error=Game not found`);
      }

      if (new Date(targetGame.startTime).getTime() <= Date.now()) {
        return res.redirect(
          `/join/${gameId}?error=This game has already started and cannot be joined.`
        );
      }

      const startDT = DateTime.fromJSDate(new Date(targetGame.startTime)).toUTC();
      const endDT = DateTime.fromJSDate(new Date(targetGame.endTime)).toUTC();
      if (await hasTimeConflict(userId, startDT, endDT)) {
        return res.redirect(
          `/join/${gameId}?error=You have another game or gym session that overlaps this time.`
        );
      }


      // // Check for time clash with already joined games
      // const joinedGames = await joinGameData.getJoinedGamesByUser(userId);
      // const hasTimeClash = joinedGames.some((g) => {
      //   const gStart = new Date(g.startTime);
      //   const gEnd = new Date(g.endTime);
      //   return (
      //     new Date(targetGame.startTime) < gEnd &&
      //     new Date(targetGame.endTime) > gStart
      //   );
      // });

      // if (hasTimeClash) {
      //   return res.redirect("/join?error=You already have a game at this time");
      // }

      await joinGameData.joinGame(gameId, userId);

      const user = await User.findById(userId);

      await sendGameEmail(
        user.email,
        `Game Confirmation: ${targetGame.title}`,
        `<p>Hi ${user.username},</p><p>You have successfully joined <strong>${targetGame.title
        }</strong> on ${new Date(targetGame.startTime).toLocaleString()}.</p>`
      );

      // Schedule reminder
      const reminderTime = new Date(
        new Date(targetGame.startTime) - 60 * 60 * 1000
      ); // 1 hr before

      const reminder = await Reminder.create({
        userEmail: user.email,
        gameId: targetGame._id,
        gameTitle: targetGame.title,
        gameStartTime: targetGame.startTime,
        gameLocation: targetGame.location,
        reminderTime,
      });

      scheduleJobFromReminder(reminder);

      return res.redirect('/join/success');
    } catch (e) {
      console.error('Error joining game:', e);
      return res.redirect(`/join?error=${encodeURIComponent(e.message)}`);
    }
  });

router.get("/filter", async (req, res) => {
  try {
    const {
      sport,
      date,
      playersLeft,
      friendsOnly,
      skillLevel,
      minPlayers,
      maxCost,
      city,
    } = req.query;
    const userId = req.user?.userId;
    const filters = {};

    const now = new Date();
    if (date === "today") {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      filters.startTime = { $gte: now, $lte: endOfToday };
    } else if (date === "1+") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filters.startTime = { $gte: tomorrow };
    } else if (date === "2+") {
      const dayAfter = new Date(now);
      dayAfter.setDate(dayAfter.getDate() + 2);
      filters.startTime = { $gte: dayAfter };
    }

    if (sport) {
      filters.sport = { $in: Array.isArray(sport) ? sport : [sport] };
    }

    if (playersLeft) {
      filters.$expr = {
        $gt: [
          { $subtract: ["$playersRequired", { $size: "$players" }] },
          Number(playersLeft) - 1,
        ],
      };
    }

    if (friendsOnly === "true" && req.user) {
      const userProfile = await userProfileData.getProfile(req.user.userId);
      if (userProfile?.following?.length) {
        filters.host = { $in: userProfile.following };
      } else {
        filters.host = { $in: [] }; // No friends
      }
    }

    if (
      skillLevel &&
      ["Beginner", "Intermediate", "Advanced"].includes(skillLevel)
    ) {
      filters.skillLevel = skillLevel;
    }

    if (minPlayers) {
      filters.playersRequired = {
        ...(filters.playersRequired || {}),
        $gte: Number(minPlayers),
      };
    }

    if (maxCost) {
      filters.costPerHead = { $lte: Number(maxCost) };
    }

    if (city) {
      filters.location = new RegExp(city, "i"); // partial match
    }

    const games = await hostGameData.getAllGames(filters);
    const plainGames = games
      .filter((g) => new Date(g.endTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .map((g) => g.toObject());

    res.json({ games: plainGames });
  } catch (error) {
    console.error("🔥 Filter route error:", error);
    res.status(500).send(error.message);
  }
});

router.get("/success", (req, res) => {
  res.render("joinGame/joinGameSuccess", {
    title: "Successfully Joined",
    message: "You have successfully joined the game!",
    layout: "main",
    profileCompleted: req.user?.profileCompleted || false,
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
    const now = new Date();
    const gameStart = new Date(game.startTime);
    const nowRounded = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes()
    );
    const gameStartRounded = new Date(
      gameStart.getFullYear(),
      gameStart.getMonth(),
      gameStart.getDate(),
      gameStart.getHours(),
      gameStart.getMinutes()
    );

    const gameAlreadyStarted = new Date(game.startTime).getTime() <= Date.now();

    const [lng, lat] = game.geoLocation.coordinates;

    res.render("joinGame/gameDetails", {
      game: game.toObject(),
      lat,
      lng,
      hostId: game.host._id.toString(),
      isLoggedIn,
      userId,
      isHost,
      hasJoined,
      joinedPlayers,
      joinedGameIdStrings,
      gameAlreadyStarted,
      error: req.query.error || null,
      username: req.user?.username || null,
      layout: "main",
      profileCompleted: req.user?.profileCompleted || false,
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
  // Prevent host from leaving their own game
  try {
    const game = await hostGameData.getGameById(gameId);
    if (!game) return res.status(404).send("Game not found");

    await joinGameData.leaveGame(gameId, userId);
    res.redirect("/join");
  } catch (e) {
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
});

export default router;
