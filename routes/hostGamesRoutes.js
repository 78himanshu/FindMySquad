import { Router } from "express";
const router = Router();
import { hostGameData } from "../data/index.js";
import { checkString, checkNumber } from "../utils/helper.js";
import requireAuth from "../middleware/auth.js";
import axios from "axios";
import { DateTime } from 'luxon';
import xss from 'xss';



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
    try {
      const x = req.body;
      x.host = req.user.userID;

      x.title = xss(x.title).trim();
      x.sport = xss(x.sport).trim();
      x.skillLevel = xss(x.skillLevel).trim();
      x.description = xss(x.description).trim();
      x.location = xss(x.location).trim();
      x.extraInfo = xss(x.extraInfo?.trim() || "");
      x.bringEquipment = x.bringEquipment === "true" || x.bringEquipment === true;
      x.costShared = x.costShared === "true" || x.costShared === true;
      x.playersRequired = Number(x.playersRequired);
      x.costPerHead = Number(x.costPerHead);

      const requiredFields = [
        "title", "sport", "gameDate", "startTime", "endTime",
        "skillLevel", "description", "location", "host", "userTimeZone"
      ];
      for (const field of requiredFields) {
        const value = x[field];
        if (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "")
        ) {
          return res.status(400).json({ success: false, error: `Missing or invalid: ${field}` });
        }
      }

      const convertTo24Hour = (timeStr) => {
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      };

      const rawStart = convertTo24Hour(x.startTime);
      const rawEnd = convertTo24Hour(x.endTime);

      const startDateTime = DateTime.fromISO(`${x.gameDate}T${rawStart}`, { zone: x.userTimeZone });
      let endDateTime = DateTime.fromISO(`${x.gameDate}T${rawEnd}`, { zone: x.userTimeZone });

      if (endDateTime <= startDateTime) {
        endDateTime = endDateTime.plus({ days: 1 });
      }

      const now = DateTime.now().setZone(x.userTimeZone);
      if (startDateTime < now) {
        return res.status(400).json({ success: false, error: "Cannot host games in the past (your local time)." });
      }

      x.startTime = startDateTime.toUTC().toJSDate();
      x.endTime = endDateTime.toUTC().toJSDate();

      if (!Number.isFinite(x.playersRequired) || x.playersRequired < 1) {
        return res.status(400).json({ success: false, error: "Players Required must be a number ≥ 1." });
      }

      if (!Number.isFinite(x.costPerHead) || x.costPerHead < 0) {
        return res.status(400).json({ success: false, error: "Cost per Head must be a number ≥ 0." });
      }


      try {
        checkString(x.title, "Title");
        checkString(x.sport, "Sport");
        checkString(x.skillLevel, "Skill Level");
        checkString(x.location, "Location");
        checkString(x.description, "Description");
        checkNumber(x.playersRequired, "Players Required", 1);
        checkNumber(x.costPerHead, "Cost per Head", 0);
        //Adding further validations
        const allowedSports = [
          "Soccer", "Basketball", "Baseball", "Tennis", "Swimming",
          "Running", "Cycling", "Hiking", "Golf", "Volleyball"
        ];
        const allowedSkillLevels = ["Beginner", "Intermediate", "Advanced"];

        if (!allowedSports.includes(x.sport)) {
          return res.status(400).json({ error: "Invalid sport selected" });
        }
        if (!allowedSkillLevels.includes(x.skillLevel)) {
          return res.status(400).json({ error: "Invalid skill level selected" });
        }
        const badWords = [
          "fuck", "shit", "bitch", "asshole", "dick", "pussy", "cunt", "sex",
          "nigger", "nigga", "fag", "faggot", "slut", "whore", "bastard", "damn",
          "bullshit", "crap", "motherfucker", "cock", "tit", "dildo", "rape",
          "suck", "kill yourself", "kys", "die", "retard", "moron",
          "@$$", "f*ck", "s3x", "sh!t", "b!tch", "d!ck", "w#ore", "r@pe"
        ];
        const lowered = x.description.toLowerCase();
        for (let word of badWords) {
          if (lowered.includes(word)) {
            return res.status(400).json({ error: "Description contains inappropriate language." });
          }
        }
      } catch (e) {
        return res.status(400).json({ error: e.message });
      }
      try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const encodedLoc = encodeURIComponent(x.location);
        const geoRes = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLoc}&key=${apiKey}`
        );

        if (
          !geoRes.data ||
          !geoRes.data.results ||
          !geoRes.data.results[0]?.geometry?.location
        ) {
          return res.status(400).json({ success: false, error: "Invalid address entered." });
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
          x.playersRequired,
          x.startTime,
          x.endTime,
          x.description,
          x.costPerHead,
          x.skillLevel,
          x.host,
          x.location,
          geoLocation,
          x.bringEquipment,
          x.costShared,
          x.extraInfo
        );

        return res.json({
          success: true,
          message: "Game successfully hosted!",
          gameId: newGame._id
        });

      } catch (e) {
        console.error("Error in /host:", e.message || e);
        return res.status(400).json({ success: false, error: e.message || "Unknown error occurred." });
      }
    } catch (e) {
      console.error("Error in /host:", e.message || e);
      return res.status(400).json({ success: false, error: e.message || "Unknown error occurred." });
    }
  }
  );



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

    res.render("hostGame/hostGameForm", {
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



router.post("/edit/:id", requireAuth, async (req, res) => {
  try {
    console.log("Received body:", req.body);
    const {
      title,
      sport,
      gameDate,
      startTime: startStr,
      endTime: endStr,
      playersRequired,
      costPerHead,
      description,
      skillLevel,
      location,
      bringEquipment,
      costShared,
      extraInfo,
      userTimeZone
    } = req.body;

    // Validation
    if (
      !title || !sport || !gameDate || !startStr || !endStr ||
      !description || !skillLevel || !location
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const allowedSports = ["Soccer", "Basketball", "Baseball", "Tennis", "Swimming", "Running", "Cycling", "Hiking", "Golf", "Volleyball"];
    const allowedSkills = ["Beginner", "Intermediate", "Advanced"];
    if (!allowedSports.includes(sport)) {
      return res.status(400).json({ error: "Invalid sport selected." });
    }
    if (!allowedSkills.includes(skillLevel)) {
      return res.status(400).json({ error: "Invalid skill level selected." });
    }

    const sanitizedDescription = xss(description.trim());
    const badWords = ["fuck", "shit", "bitch", "rape", "kys", "kill yourself", "nigger", "faggot"];
    const lowered = sanitizedDescription.toLowerCase();
    for (const word of badWords) {
      if (lowered.includes(word)) {
        return res.status(400).json({ error: "Description contains inappropriate language." });
      }
    }

    // Time parsing with Luxon
    const rawStart = DateTime.fromISO(`${gameDate}T${startStr}`, { zone: userTimeZone });
    let rawEnd = DateTime.fromISO(`${gameDate}T${endStr}`, { zone: userTimeZone });
    if (rawEnd <= rawStart) rawEnd = rawEnd.plus({ days: 1 });

    const now = DateTime.now().setZone(userTimeZone);
    if (rawStart < now) {
      return res.status(400).json({ error: "Cannot host games in the past." });
    }

    const updates = {
      title: xss(title.trim()),
      sport: xss(sport.trim()),
      startTime: rawStart.toUTC().toJSDate(),
      endTime: rawEnd.toUTC().toJSDate(),
      playersRequired: Number(playersRequired),
      costPerHead: Number(costPerHead),
      description: sanitizedDescription,
      skillLevel: xss(skillLevel.trim()),
      location: xss(location.trim()),
      bringEquipment: bringEquipment === "true" || bringEquipment === true,
      costShared: costShared === "true" || costShared === true,
      extraInfo: xss(extraInfo || "")
    };

    console.log("✅ Final updates:", updates);

    const updatedGame = await hostGameData.updateGame(req.params.id, updates, req.user.userID);

    return res.json({ success: true, message: "Game updated!", gameId: updatedGame._id });
  } catch (err) {
    console.error("❌ Edit error:", err);
    return res.status(400).json({ error: err.message });
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

    await hostGameData.deleteGame(gameId, userId);
    res.redirect("/join");
  } catch (e) {
    res.status(500).send(e.message);
  }
});
export default router;
