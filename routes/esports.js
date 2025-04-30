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

  // 2. Route to show tournaments for a specific game
router.get('/game/:gameName', async (req, res) => {
  try {
    const gameName = decodeURIComponent(req.params.gameName);
    const allTournaments = await Tournament.find({ game: gameName })
  .populate('creator', 'username')
  .sort({ date: 1 });

const now = new Date();
const upcomingTournaments = [];
const pastTournaments = [];
let highestPrize = 0;

allTournaments.forEach(t => {
  // Combine date + time to create full datetime object
  const dateStr = t.date.toISOString().split('T')[0];
  const tournamentDateTime = new Date(`${dateStr}T${t.time}`);

  // Calculate flags
  const hasStarted = tournamentDateTime <= now;
  const isSameHour = tournamentDateTime.getHours() === now.getHours() &&
                     tournamentDateTime.getDate() === now.getDate() &&
                     tournamentDateTime.getMonth() === now.getMonth() &&
                     tournamentDateTime.getFullYear() === now.getFullYear();

  t.hasStarted = hasStarted;
  t.isOngoing = isSameHour;

  if (!hasStarted) {
    upcomingTournaments.push(t);
    highestPrize = Math.max(highestPrize, t.prizePool?.total || 0);
  } else {
    pastTournaments.push(t);
  }
});

    

    res.render('egaming/gameTournaments', {
      title: gameName,
      gameName,
      backgroundImage: getGameImage(gameName),
      tournaments: upcomingTournaments,
      pastTournaments,
      highestPrize
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Show Register Team Page
router.get('/:tournamentId/register-team', requireAuth, async (req, res) => {
  const tournament = await Tournament.findById(req.params.tournamentId)
    .populate('teams.players', 'username')
    .populate('creator', 'username');
  if (!tournament) return res.status(404).send('Tournament not found.');

  const userId = req.user.userId.toString();
  const playersPerTeam = parseInt(tournament.format[0], 10);

  // 1) Creator?
  const isCreator = tournament.creator._id.toString() === userId;

  // 2) Already in a team?
  let isAlreadyInTeam = false;
  let isTeamLeader = false;
  let userTeam = null;
  for (const team of tournament.teams) {
    if (team.players.some(p => p._id.toString() === userId)) {
      isAlreadyInTeam = true;
      userTeam = team;
      // leader is first in array
      isTeamLeader = team.players[0]._id.toString() === userId;
      break;
    }
  }

  return res.render('egaming/registerTeam', {
    tournament,
    playersPerTeam: parseInt(tournament.format[0], 10),
    userId,
    isCreator,
    isAlreadyInTeam,
    isTeamLeader,
    userTeam,
    backgroundImage: getGameImage(tournament.game)
  });
});




// 4. Route: POST -> Register a team
router.post('/:tournamentId/register-team', requireAuth, async (req, res) => {
  const { action, teamName,teamDescription, joinTeamId } = req.body;
  const tournament = await Tournament.findById(req.params.tournamentId).populate('creator');
  if (!tournament) return res.status(404).send('Tournament not found.');

  const userId = req.user.userId.toString();
  const playersPerTeam = parseInt(tournament.format[0], 10);

  // 1) Creator can’t register
  if (tournament.creator._id.toString() === userId) {
    return res.status(403).send('You created this tournament and cannot join.');
  }

  // 2) Check if already in a team (leader or member)
  const userTeam = tournament.teams.find(team =>
    team.players.some(p => p != null && p.toString() === userId)
  );
  if (userTeam) {
    const isLeader = userTeam.players[0].toString() === userId;
    if (isLeader) {
      return res.status(400).send('As a team leader you cannot create or join another team.');
    }
    return res.status(400).send('You are already part of a team in this tournament.');
  }

  // Now we’re safe to create or join:
  if (action === 'create') {
    if (!teamName || teamName.trim().length < 2) {
      return res.status(400).send('Team name must be at least 2 characters.');
    }
    if (!teamDescription || teamDescription.trim().length < 5) {
      return res.status(400).send('Team description must be 5–200 characters.');
    }
    const normalized = teamName.trim().toLowerCase();
    if (tournament.teams.some(t => t.teamName.trim().toLowerCase() === normalized)) {
      return res.status(400).send('Team name already taken.');
    }
    tournament.teams.push({
            teamName: teamName.trim(),
            teamDescription: teamDescription.trim(),
            players: [userId]
      });
  } else if (action === 'join') {
    const team = tournament.teams.id(joinTeamId);
    if (!team) return res.status(404).send('Team not found.');
    if (team.players.length >= playersPerTeam) {
      return res.status(400).send('That team is already full.');
    }
    team.players.push(userId);
  }

  await tournament.save();
  // send them back to see their new status
  return res.redirect(`/esports/${req.params.tournamentId}/register-team`);
});



// Route: POST -> Leave Team
router.post('/:tournamentId/leave-team', requireAuth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) return res.status(404).send('Tournament not found');

    const userId = req.user.userId.toString();

    // Find the team the user is part of
    const team = tournament.teams.find(team =>
      team.players.some(p => p != null && p.toString() === userId)
    );

    if (!team) return res.status(400).send('You are not part of any team');

    team.players = team.players.filter(p => p != null && p.toString() !== userId);

    // Remove the team if it's empty
    if (team.players.length === 0) {
      tournament.teams = tournament.teams.filter(t =>
            t._id.toString() !== team._id.toString()
          );
    }

    await tournament.save();
    res.redirect(`/esports/${req.params.tournamentId}/register-team`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Remove a member from any team
router.post('/:tournamentId/team/:teamId/remove-member', requireAuth, async (req, res) => {
  const { tournamentId, teamId } = req.params;
  const { memberId } = req.body;
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) return res.status(404).send('Tournament not found');
  const userId = req.user.userId.toString();

  // locate the team
  const team = tournament.teams.id(teamId);
  if (!team) return res.status(404).send('Team not found');

  // only creator or that team’s leader can remove
  const isCreator = tournament.creator.toString() === userId;
  const isLeader  = team.players[0].toString() === userId;
  if (!isCreator && !isLeader) return res.status(403).send('Forbidden');

  // remove the member
  team.players = team.players.filter(p => p.toString() !== memberId);
  await tournament.save();
  res.redirect(`/esports/${tournamentId}/register-team`);
});

// Disband (delete) an entire team
router.post('/:tournamentId/team/:teamId/disband', requireAuth, async (req, res) => {
  const { tournamentId, teamId } = req.params;
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) return res.status(404).send('Tournament not found');
  const userId = req.user.userId.toString();

  const team = tournament.teams.id(teamId);
  if (!team) return res.status(404).send('Team not found');

  // only creator or that team’s leader
  const isCreator = tournament.creator.toString() === userId;
  const isLeader  = team.players[0].toString() === userId;
  if (!isCreator && !isLeader) return res.status(403).send('Forbidden');

  // remove the team
  tournament.teams = tournament.teams.filter(t => t._id.toString() !== teamId);
  await tournament.save();
  res.redirect(`/esports/${tournamentId}/register-team`);
});

export default router;
