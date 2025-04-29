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

  res.render('egaming/createTournament', {
    games: esportsGames,
    username: req.user?.username
  });
});

// POST: Handle Form Submission
router.post('/create', requireAuth, async (req, res) => {
  const { game, format, date, time, description, skillLevel, maxTeams, total, first, second, third } = req.body;

  if (Number(first) + Number(second) + Number(third) !== Number(total)) {
    return res.status(400).send("1st + 2nd + 3rd must equal total prize pool.");
  }

  if (Number(third) > Number(second)) {
    return res.status(400).send("3rd prize must be less than or equal to 2nd prize.");
  }

  if (Number(maxTeams) > 100) {
    return res.status(400).send("Max teams cannot exceed 100.");
  }
  console.log("USER:", req.user);


  try {
    const tournament = new Tournament({
      creator: req.user.userID,
      game,
      format,
      date,
      time,
      description,
      skillLevel,
      maxTeams,
      teams:[],
      prizePool: { total, first, second, third }
    });

    await tournament.save();
    res.redirect('/esports');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

export default router;
