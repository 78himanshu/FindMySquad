import express from 'express';
import Tournament from '../models/tournament.js';
import { requireAuth } from '../middleware/authMiddleware.js'; // Optional middleware

const router = express.Router();

// GET: Render Create Tournament Form
router.get('/create', requireAuth, (req, res) => {
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
  "Apex Legends"
];
const minDate = new Date().toISOString().split('T')[0];
res.render('egaming/createTournament', {
  games: esportsGames,
  username: req.user?.username,
  minDate
});
  res.render('egaming/createTournament', {
    games: esportsGames,
    username: req.user?.username
  });
});
// POST: Handle Form Submission
router.post('/create', requireAuth, async (req, res) => {
  try {
    let {
      game,
      format,
      date,
      startTime,
      endTime,
      description,
      skillLevel,
      maxTeams,
      prizeDescription
    } = req.body;

    // trim
    prizeDescription = prizeDescription?.trim();

    // 1) Prize Description: 5–50 chars
    if (
      !prizeDescription ||
      prizeDescription.length < 5 ||
      prizeDescription.length > 50
    ) {
      return res
        .status(400)
        .send('Prize Description must be between 5 and 50 characters.');
    }

    // 2) Date cannot be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(date);
    if (chosen < today) {
      return res.status(400).send('Date cannot be in the past.');
    }

    // 3) Start/end times: start < end
    if (!startTime || !endTime || startTime >= endTime) {
      return res
        .status(400)
        .send('Start time must be before end time.');
    }

    // 4) Max teams between 1 and 100
    maxTeams = parseInt(maxTeams, 10);
    if (isNaN(maxTeams) || maxTeams < 1 || maxTeams > 100) {
      return res
        .status(400)
        .send('Max teams must be between 1 and 100.');
    }

    // create and save
    const tournament = new Tournament({
      creator: req.user.userID,
      game,
      format,
      date,
      startTime,
      endTime,
      description,
      skillLevel,
      maxTeams,
      teams: [],
      prizeDescription
    });

    await tournament.save();
    res.redirect('/esports');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

export default router;