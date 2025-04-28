import { Router } from 'express';
import Tournament from '../models/tournament.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

const games = [
  { title: "Call of Duty: Black Ops 6", image: "/images/cod-bo6.jpeg", platform: "Cross-Platform" },
  { title: "Call of Duty Black Ops 6 Zombies", image: "/images/cod-bo6-zombies.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Warzone Verdansk", image: "/images/cod-warzone.jpeg", platform: "Cross-Platform" },
  { title: "Fortnite: Battle Royale", image: "/images/fortnite.jpg", platform: "PS5 / Xbox / PC" },
  { title: "Marvel Rivals", image: "/images/marvel-rivals.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Modern Warfare 3", image: "/images/cod-mw3.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Black Ops Cold War", image: "/images/cod-coldwar.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Vanguard", image: "/images/cod-vanguard.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: WWII", image: "/images/cod-wwii.jpg", platform: "PS4 / Xbox" },
  { title: "Call of Duty: Black Ops 4", image: "/images/cod-bo4.jpg", platform: "PS4 / Xbox" },
  { title: "Call of Duty: Black Ops III", image: "/images/cod-bo3.jpeg", platform: "Cross-Platform" },
  { title: "Call of Duty: Ghosts", image: "/images/cod-ghosts.jpg", platform: "Cross-Platform" },
  { title: "Fall Guys: Ultimate Knockout", image: "/images/fall-guys.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Modern Warfare Remastered", image: "/images/cod-mw-remastered.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Modern Warfare 2", image: "/images/cod-mw2.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Modern Warfare", image: "/images/cod-mw.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Black Ops II", image: "/images/cod-bo2.jpg", platform: "PC" },
  { title: "Call of Duty: Warzone Mobile", image: "/images/warzone-mobile.jpg", platform: "Mobile" },
  { title: "MLB The Show 25", image: "/images/mlb25.jpg", platform: "Cross-Platform" },
  { title: "Madden 25", image: "/images/madden25.jpg", platform: "Cross-Platform" },
  { title: "College Football 25", image: "/images/college-fb25.jpg", platform: "Cross-Platform" },
  { title: "NBA 2K25", image: "/images/nba2k25.jpg", platform: "Cross-Platform" },
  { title: "NBA 2K24", image: "/images/nba2k24.jpg", platform: "Cross-Platform" },
  { title: "FC 25", image: "/images/fc25.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Advanced Warfare", image: "/images/cod-advanced.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Black Ops", image: "/images/cod-bo.jpg", platform: "PC" },
  { title: "Halo Infinite", image: "/images/halo.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Infinite Warfare", image: "/images/cod-infinite.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Modern Warfare 3 (2011)", image: "/images/cod-mw3-2011.jpg", platform: "PC" },
  { title: "Call of Duty: Modern Warfare 2 (2009)", image: "/images/cod-mw2-2009.jpg", platform: "Xbox" },
  { title: "Call of Duty: Black Ops Cold War Zombies", image: "/images/cod-coldwar-zombies.jpg", platform: "Cross-Platform" },
  { title: "Call of Duty: Blackout", image: "/images/cod-blackout.jpg", platform: "Cross-Platform" },
  { title: "League of Legends", image: "/images/lol.jpg", platform: "PC" },
  { title: "Rogue Company", image: "/images/rogue.jpg", platform: "Cross-Platform" },
  { title: "Gears 5", image: "/images/gears5.jpg", platform: "Xbox" },
  { title: "Clash Royale", image: "/images/clash.jpg", platform: "Mobile" },
  { title: "Valorant", image: "/images/valorant.jpg", platform: "PC" },
  { title: "Rocket League", image: "/images/rocket.jpg", platform: "Cross-Platform" },
  { title: "Apex Legends", image: "/images/apex.jpg", platform: "Cross-Platform" }
];

  const getGameImage = (gameName) => {
    const gameImageMap = Object.fromEntries(
      games.map(g => [g.title, g.image])
    );
    return gameImageMap[gameName] || '/images/default.jpg';
  };

router.get('/', (req, res) => {
  res.render('egaming/esports', {
    title: 'Esports',
    games: games
  });
});

// Route to show tournaments for a specific game
router.get('/:gameName', async (req, res) => {
  try {
    const gameName = decodeURIComponent(req.params.gameName);
    const tournaments = await Tournament.find({ game: gameName })
      .populate('creator', 'username')
      .sort({ date: 1 }); // earliest first

    res.render('egaming/gameTournaments', {
      title: gameName,
      gameName,
      backgroundImage: getGameImage(gameName),
      tournaments
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.get('/:tournamentId/register-team',requireAuth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) {
      return res.status(404).send('Tournament not found');
    }
    res.render('egaming/registerTeam', { tournament });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/:tournamentId/register-team',requireAuth, async (req, res) => {
  try {
    const { teamName } = req.body;
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) {
      return res.status(404).send('Tournament not found');
    }

    if (tournament.teams.some(team => team.teamName === teamName)) {
      return res.status(400).send('Team name already taken');
    }

    tournament.teams.push({
      teamName,
      players: [req.user._id]
    });

    await tournament.save();

    res.redirect(`/esports/game/${encodeURIComponent(tournament.game)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
