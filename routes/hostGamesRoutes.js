import { Router } from "express";
const router = Router();
import { hostGameData } from "../data/index.js";
import { checkString, checkNumber } from "../utils/helper.js";
import requireAuth from "../middleware/auth.js";
import axios from "axios";

router
  .route("/")
  .get(requireAuth, (req, res) => {
    const hostId = req.user.userID;
    res.render("hostGame/hostGameForm", {
      hostId,
      title: "Host a Game",
      layout: "main",
      head: `
          <link rel="stylesheet" href="/css/hostGame.css">
        `,
    });
  })
  .post(requireAuth, async (req, res) => {
    const x = req.body;
    x.host = req.user.userID;
    x.playersRequired = Number(x.playersRequired);
    x.costPerHead = Number(x.costPerHead);

    // for date + times into Date objects
    // const gameDate = new Date(x.gameDate);
    // const [startHours, startMinutes] = x.startTime.split(":");
    // const [endHours, endMinutes] = x.endTime.split(":");

    // x.startTime = new Date(gameDate);
    // x.startTime.setHours(startHours, startMinutes);

    // x.endTime = new Date(gameDate);
    // x.endTime.setHours(endHours, endMinutes);

const dateStr = x.gameDate; // format: YYYY-MM-DD
x.startTime = new Date(`${dateStr}T${x.startTime}:00Z`);
x.endTime = new Date(`${dateStr}T${x.endTime}:00Z`);


    // Validation for start and end time.
    if (x.startTime >= x.endTime) {
      return res
        .status(400)
        .json({ error: "End time must be after start time" });
    }

    if (x.startTime < new Date()) {
      return res.status(400).json({ error: "Cannot host games in the past." });
    }

    if (!x || Object.keys(x).length === 0) {
      return res
        .status(400)
        .json({ error: "There are no fields in the request body" });
    }
    const requiredFields = [
      "title",
      "sport",
      "venue",
      "gameDate",
      "startTime",
      "endTime",
      "skillLevel",
      "host",
      "location",
    ];

    for (const field of requiredFields) {
      const value = x[field];
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return res.status(400).json({ error: `Missing or invalid: ${field}` });
      }
    }

    if (isNaN(x.playersRequired) || isNaN(x.costPerHead)) {
      return res
        .status(400)
        .json({ error: "Players Required and Cost must be numbers" });
    }
    try {
      checkString(x.title, "Title");
      checkString(x.sport, "Sport");
      checkString(x.venue, "Venue");
      checkString(x.skillLevel, "Skill Level");
      checkString(x.location, "Location");
      checkString(x.description, "Description");
      checkNumber(x.playersRequired, "Players Required", 1);
      checkNumber(x.costPerHead, "Cost per Head", 0);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      const encodedLoc = encodeURIComponent(x.location);
      const geoRes = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLoc}&key=${apiKey}`
      );
      console.log("Geocode API result:", geoRes.data);
      if (
        !geoRes.data ||
        !geoRes.data.results ||
        !geoRes.data.results[0]?.geometry?.location
      ) {
        return res.status(400).json({ error: "Invalid address entered." });
      }
      const { lat, lng } = geoRes.data.results[0].geometry.location;
      const formattedAddress = geoRes.data.results[0].formatted_address;
      const geoLocation = {
        type: "Point",
        coordinates: [lng, lat]
      };
      x.location = formattedAddress;
      const newGame = await hostGameData.createGame(
        x.title,
        x.sport,
        x.venue,
        x.playersRequired,
        x.startTime,
        x.endTime,
        x.description,
        x.costPerHead,
        x.skillLevel,
        x.host,
        x.location,
        geoLocation
      );
      console.log(" Game created:", newGame);
      return res.redirect("/host/success");
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

router
  .route("/success")
  .get((req, res) => {
    res.render("hostGame/hostGameSuccess", {
      title: "Game Hosted!",
      layout: "main",
      head: `<link rel="stylesheet" href="/css/hostGame.css">`,
    });
  });

router
  .route("/form")
  .get(requireAuth, (req, res) => {
    const hostId = req.user.userID;
    res.render("hostGame/hostGameForm", {
      hostId,
      title: "Host a Game",
      layout: "main",
      head: `
          <link rel="stylesheet" href="/css/hostGame.css">
        `,
    });
  });



// Edit Game Form
router.get("/edit/:id", requireAuth, async (req, res) => {
  try {
    const game = await hostGameData.getGameById(req.params.id);

    if (!game) {
      return res.status(404).render("error", { error: "Game not found" });
    }

    // Host Check: Only allow host to edit
    if (game.host.toString() !== req.user.userID) {
      return res.status(403).render("error", { error: "Unauthorized access" });
    }

    res.render("hostGame/editGameForm", {
      game: game.toObject(),
      hostId: req.user.userID,
      title: "Edit Game",
      layout: "main",
      head: `<link rel="stylesheet" href="/css/hostGame.css">`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: "Server Error" });
  }
});

// Handle Edit Submission
router.post("/edit/:id", requireAuth, async (req, res) => {
  try {
    const updates = req.body;

    // const gameDate = new Date(updates.gameDate);
    // const [startHours, startMinutes] = updates.startTime.split(":");
    // const [endHours, endMinutes] = updates.endTime.split(":");

    // updates.startTime = new Date(gameDate);
    // updates.startTime.setHours(startHours, startMinutes);
    // updates.endTime = new Date(gameDate);
    // updates.endTime.setHours(endHours, endMinutes);
    const gameDate = new Date(updates.gameDate);
    const [startHours, startMinutes] = updates.startTime.split(":");
    const [endHours, endMinutes] = updates.endTime.split(":");
    
    updates.startTime = new Date(Date.UTC(
      gameDate.getFullYear(),
      gameDate.getMonth(),
      gameDate.getDate(),
      startHours,
      startMinutes
    ));
    
    updates.endTime = new Date(Date.UTC(
      gameDate.getFullYear(),
      gameDate.getMonth(),
      gameDate.getDate(),
      endHours,
      endMinutes
    ));
        
    if (updates.startTime >= updates.endTime) {
      return res.status(400).send("End time must be after start time");
    }

    await hostGameData.updateGame(req.params.id, updates, req.user.userID);
    res.redirect("/join");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/delete/:id", requireAuth, async (req, res) => {
  try {
    const gameId = req.params.id;
    const userId = req.user.userID;
    const game = await hostGameData.getGameById(gameId);

    if (!game) {
      return res.status(404).send("Game not found.");
    }

    if (game.host.toString() !== userId) {
      return res
        .status(403)
        .send("You are not authorized to delete this game.");
    }

    await hostGameData.deleteGame(gameId,userId);
    res.redirect("/join");
  } catch (e) {
    res.status(500).send(e.message);
  }
});
export default router;
