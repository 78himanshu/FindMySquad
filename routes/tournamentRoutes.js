import express from "express";
import Tournament from "../models/tournament.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { updateKarmaPoints } from "../utils/karmaHelper.js";
import { evaluateAchievements } from "../utils/achievementHelper.js";

const router = express.Router();

const minDate = new Date().toISOString().split("T")[0];
const esportsGames = [
  "Call of Duty: Black Ops 6",
  "Call of Duty Black Ops 6 Zombies",
  "Call of Duty: Warzone Verdansk",
  "Fortnite: Battle Royale",
  "Marvel Rivals",
  "Call of Duty: Modern Warfare 3",
  "Call of Duty: Black Ops Cold War",
  "Call of Duty: Vanguard",
  "Call of Duty: WWII",
  "Call of Duty: Black Ops 4",
  "Call of Duty: Black Ops III",
  "Call of Duty: Ghosts",
  "Fall Guys: Ultimate Knockout",
  "Call of Duty: Modern Warfare Remastered",
  "Call of Duty: Modern Warfare 2",
  "Call of Duty: Modern Warfare",
  "Call of Duty: Black Ops II",
  "Call of Duty: Warzone Mobile",
  "MLB The Show 25",
  "Madden 25",
  "College Football 25",
  "NBA 2K25",
  "NBA 2K24",
  "FC 25",
  "Call of Duty: Advanced Warfare",
  "Call of Duty: Black Ops",
  "Halo Infinite",
  "Call of Duty: Infinite Warfare",
  "Call of Duty: Modern Warfare 3 (2011)",
  "Call of Duty: Modern Warfare 2 (2009)",
  "Call of Duty: Black Ops Cold War Zombies",
  "Call of Duty: Blackout",
  "League of Legends",
  "Rogue Company",
  "Gears 5",
  "Clash Royale",
  "Valorant",
  "Rocket League",
  "Apex Legends",
];
// GET: Render Create Tournament Form
router.get("/create", requireAuth, (req, res) => {
  res.render("egaming/createTournament", {
    layout: "main",
    title: "Create Tournament",
    games: esportsGames,
    username: req.user.username,
    profileCompleted: req.user?.profileCompleted || false,
    minDate,
  });
});
// POST: Handle Form Submission
router.post("/create", requireAuth, async (req, res, next) => {
  const {
    game,
    format,
    date,
    startTime,
    endTime,
    description: rawDescription,
    skillLevel,
    maxTeams: rawMaxTeams,
    prizeDescription: rawPrizeDescription,
  } = req.body;

  // trim
  const description = rawDescription?.trim() || "";
  const prizeDescription = rawPrizeDescription?.trim() || "";
  const maxTeams = parseInt(rawMaxTeams, 10);

  // collect formData to re-populate on HTML errors
  const formData = {
    game,
    format,
    date,
    startTime,
    endTime,
    description,
    skillLevel,
    maxTeams: rawMaxTeams,
    prizeDescription,
  };

  // helper to return HTML render or JSON error
  function respondError(msg) {
    return res.format({
      html: () =>
        res.status(400).render("egaming/createTournament", {
          layout: "main",
          title: "Create Tournament",
          games: esportsGames,
          username: req.user.username, // so you still show the user’s name
          minDate,
          error: msg,
          formData,
        }),
      json: () => res.status(400).json({ error: msg }),
    });
  }
  //  0) Check that every top‐level field is present
  if (!game || !esportsGames.includes(game)) {
    return respondError("Please select a valid game.");
  }
  if (!format) {
    return respondError("Format (e.g. “2v2”) is required.");
  }
  if (!skillLevel) {
    return respondError("Please choose a skill level.");
  }
  if (!date) {
    return respondError("Date is required.");
  }
  if (!description) {
    return respondError("Tournament description cannot be empty.");
  }
  if (description.length < 10) {
    return respondError("Description must be at least 10 characters.");
  }

  // 1) Prize Description: 5–50 chars
  if (
    !prizeDescription ||
    prizeDescription.length < 5 ||
    prizeDescription.length > 50
  ) {
    return respondError(
      "Prize Description must be between 5 and 50 characters."
    );
  }

  // 2) Date cannot be in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = date.split("-").map(Number);
  const chosenDate = new Date(y, m - 1, d);
  if (chosenDate < today) {
    return respondError("Date cannot be in the past.");
  }

  // 3) Build full Date objects for start/end
  const [sh, smin] = startTime.split(":").map(Number);
  const [eh, emin] = endTime.split(":").map(Number);
  const startDateTime = new Date(y, m - 1, d, sh, smin);
  const endDateTime = new Date(y, m - 1, d, eh, emin);
  const now = new Date();

  // no overlapping tournaments for this user
  //    (as creator OR participant)
  const userId = req.user.userId.toString();
  const occupied = await Tournament.find({
    $or: [{ creator: userId }, { "teams.players": userId }],
  }).lean();

  for (const t of occupied) {
    // skip if it’s this very tournament (not yet created), so no _id check
    // only compare dates
    if (new Date(t.date).toDateString() !== chosenDate.toDateString()) continue;

    const [oh1, om1] = t.startTime.split(":").map(Number);
    const [oh2, om2] = t.endTime.split(":").map(Number);
    const oStart = new Date(t.date);
    oStart.setHours(oh1, om1, 0, 0);
    const oEnd = new Date(t.date);
    oEnd.setHours(oh2, om2, 0, 0);

    // intervals overlap?
    if (startDateTime < oEnd && oStart < endDateTime) {
      return respondError(
        "You already have a tournament (hosted or joined) that overlaps this date & time."
      );
    }
  }

  // 4) Cannot start before now
  if (startDateTime < now) {
    return respondError("Start time cannot be in the past.");
  }

  // 5) End after start
  if (endDateTime <= startDateTime) {
    return respondError("End time must be after start time.");
  }

  // 6) Max teams
  if (isNaN(maxTeams) || maxTeams < 1 || maxTeams > 100) {
    return respondError("Max teams must be between 1 and 100.");
  }

  // all validations passed → create
  try {
    await Tournament.create({
      creator: req.user.userId,
      game,
      format,
      date: chosenDate,
      startTime,
      endTime,
      description,
      skillLevel,
      maxTeams,
      prizeDescription,
      teams: [],
    });
    await updateKarmaPoints(req.user.userId, 15);
    await evaluateAchievements(req.user.userId);

    return res.redirect(
      `/esports/game/${encodeURIComponent(game)}?tournamentCreated=1`
    );
  } catch (err) {
    return next(err);
  }
});

export default router;
