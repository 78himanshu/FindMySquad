import { Router } from 'express';
import Tournament from '../models/tournament.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { updateKarmaPoints } from '../utils/karmaHelper.js';

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

// 1) Esports home
router.get('/', (req, res, next) => {
  try {
    res.render('egaming/esports', {
      title: 'Esports',
      layout: 'main',
      games
    });
  } catch (err) {
    next(err);
  }
});

// 2. Route to show tournaments for a specific game
router.get('/game/:gameName', async (req, res, next) => {
  try {
    const gameName = decodeURIComponent(req.params.gameName);
    // pull in creator.username, sorted by date
    const allTournaments = await Tournament.find({ game: gameName })
      .populate('creator', 'username')
      .sort({ date: 1 })
      .lean();

    const now = new Date();
    const upcomingTournaments = [];  // includes future + ongoing
    const pastTournaments     = [];  // fully ended
    let highestPrize          = 0;

    // Grab userId if logged in (undefined otherwise)
    const userId = req.user?.userId;

    allTournaments.forEach(t => {
      // build full Date objects for start & end
      //const dateStr       = t.date.toISOString().split('T')[0];
      // const startDateTime = new Date(`${dateStr}T${t.startTime}`);
      // const endDateTime   = new Date(`${dateStr}T${t.endTime}`);
      const [startHour, startMin] = t.startTime.split(':').map(Number);
      const [endHour,   endMin]   = t.endTime.split(':').map(Number);
      // build Date() off of t.date (local) rather than toISOString()
      const startDateTime = new Date(t.date);
      startDateTime.setHours(startHour, startMin, 0, 0);
      const endDateTime = new Date(t.date);
      endDateTime.setHours(endHour, endMin, 0, 0);

      // determine state
      const hasStarted = now >= startDateTime;
      const hasEnded   = now  >  endDateTime;
      const isOngoing  = hasStarted && !hasEnded;

      // attach flags for template
      t.hasStarted = hasStarted;
      t.hasEnded   = hasEnded;
      t.isOngoing  = isOngoing;
      t.isCreator  = userId && t.creator._id.toString() === userId;

      if (hasEnded) {
        pastTournaments.push(t);
      } else {
        upcomingTournaments.push(t);
        // only consider prize from non‐ended tournaments
        highestPrize = Math.max(highestPrize, t.prizePool?.total || 0);
      }
    });
    const justCreated = req.query.tournamentCreated === '1';
    const justDeleted = req.query.tournamentDeleted === '1';

    res.render('egaming/gameTournaments', {
      title:         gameName,
      gameName,
      layout: 'main',
      backgroundImage: getGameImage(gameName),
      tournaments:     upcomingTournaments,
      pastTournaments,
      highestPrize,
      justCreated,
      justDeleted
    });
  } catch (err) {
    next(err);
  }
});


// 3) Show Register Team Page
router.get('/:tournamentId/register-team', requireAuth, async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId)
      .populate('teams.players', 'username')
      .populate('creator', 'username');
    if (!tournament) return res.status(404).send('Tournament not found.');

    const userId = req.user.userId.toString();
    const playersPerTeam = parseInt(tournament.format[0], 10);

    const isCreator = tournament.creator._id.toString() === userId;
    let isAlreadyInTeam = false;
    let isTeamLeader = false;
    let userTeam = null;
    for (const team of tournament.teams) {
      if (team.players.some(p => p._id.toString() === userId)) {
        isAlreadyInTeam = true;
        userTeam = team;
        isTeamLeader = team.players[0]._id.toString() === userId;
        break;
      }
    }

    res.render('egaming/registerTeam', {
      tournament,
      layout: 'main',
      title: 'Register Team',
      playersPerTeam,
      userId,
      isCreator,
      isAlreadyInTeam,
      isTeamLeader,
      userTeam,
      backgroundImage: getGameImage(tournament.game)
    });
  } catch (err) {
    next(err);
  }
});

// 4) Register or join a team
router.post('/:tournamentId/register-team', requireAuth, async (req, res, next) => {
  try {
    const { action, teamName, teamDescription, joinTeamId } = req.body;
    const tournament = await Tournament.findById(req.params.tournamentId).populate('creator');
    if (!tournament) return res.status(404).send('Tournament not found.');

    const userId = req.user.userId.toString();
    const playersPerTeam = parseInt(tournament.format[0], 10);

    if (tournament.creator._id.toString() === userId) {
      return res.status(403).send('You created this tournament and cannot join.');
    }

    const userTeam = tournament.teams.find(team =>
      team.players.some(p => p && p.toString() === userId)
    );
    if (userTeam) {
      const isLeader = userTeam.players[0].toString() === userId;
      if (isLeader) {
        return res.status(400).send('As a team leader you cannot create or join another team.');
      }
      return res.status(400).send('You are already part of a team in this tournament.');
    }

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
      tournament.teams.push({ teamName: teamName.trim(), description: teamDescription.trim(), players: [userId] });
      await updateKarmaPoints(userId, 10);
    } else if (action === 'join') {
      const team = tournament.teams.id(joinTeamId);
      if (!team) return res.status(404).send('Team not found.');
      if (team.players.length >= playersPerTeam) {
        return res.status(400).send('That team is already full.');
      }
      team.players.push(userId);
      await updateKarmaPoints(userId, 10);
    }

    await tournament.save();
    res.redirect(`/esports/${req.params.tournamentId}/register-team`);
  } catch (err) {
    next(err);
  }
});

// Route: POST -> Leave Team
router.post('/:tournamentId/leave-team', requireAuth, async (req, res, next) => {
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

    await updateKarmaPoints(userId, -10);

    await tournament.save();
    res.redirect(`/esports/${req.params.tournamentId}/register-team`);
  } catch (err) {
    next(err);
  }
});

// 6) Remove a member
router.post('/:tournamentId/team/:teamId/remove-member', requireAuth, async (req, res, next) => {
  try {
    const { tournamentId, teamId } = req.params;
    const { memberId } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).send('Tournament not found');

    const userId = req.user.userId.toString();
    const team = tournament.teams.id(teamId);
    if (!team) return res.status(404).send('Team not found');

    const isCreator = tournament.creator.toString() === userId;
    const isLeader = team.players[0].toString() === userId;
    if (!isCreator && !isLeader) return res.status(403).send('Forbidden');

    team.players = team.players.filter(p => p.toString() !== memberId);
    await updateKarmaPoints(memberId, -10);

    await tournament.save();
    res.redirect(`/esports/${tournamentId}/register-team`);
  } catch (err) {
    next(err);
  }
});

// 7) Disband a team
router.post('/:tournamentId/team/:teamId/disband', requireAuth, async (req, res, next) => {
  try {
    const { tournamentId, teamId } = req.params;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).send('Tournament not found');

    const userId = req.user.userId.toString();
    const team = tournament.teams.id(teamId);
    if (!team) return res.status(404).send('Team not found');

    const isCreator = tournament.creator.toString() === userId;
    const isLeader = team.players[0].toString() === userId;
    if (!isCreator && !isLeader) return res.status(403).send('Forbidden');

    for (const member of team.players) {
      if (member) await updateKarmaPoints(member.toString(), -10);
    }

    tournament.teams = tournament.teams.filter(t => t._id.toString() !== teamId);
    await tournament.save();
    res.redirect(`/esports/${tournamentId}/register-team`);
  } catch (err) {
    next(err);
  }
});

// DELETE Tournament
router.post('/:tournamentId/delete', requireAuth, async (req, res, next) => {
  try {
    const t = await Tournament.findById(req.params.tournamentId);
    if (!t) {
      return res.status(404).send('Tournament not found.');
    }
    // only the creator can delete
    if (t.creator.toString() !== req.user.userId) {
      return res.status(403).send('Forbidden');
    }

    await updateKarmaPoints(t.creator.toString(), -15); // Host loses 15

    // All other players lose 10 (skip host)
    for (const team of t.teams) {
      for (const playerId of team.players) {
        if (playerId && playerId.toString() !== t.creator.toString()) {
          await updateKarmaPoints(playerId.toString(), -10);
        }
      }
    }

    await Tournament.findByIdAndDelete(req.params.tournamentId);

    // redirect back to the game page to show the global toast
    return res.redirect(
      `/esports/game/${encodeURIComponent(t.game)}?tournamentDeleted=1`
    );
  } catch (err) {
    next(err);
  }
});


export default router;
