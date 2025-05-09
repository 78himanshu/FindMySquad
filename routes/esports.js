import { Router } from "express";
import Tournament from "../models/tournament.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { updateKarmaPoints } from "../utils/karmaHelper.js";

const router = Router();

const games = [
  {
    title: "Call of Duty: Black Ops 6",
    image: "/images/cod-bo6.jpeg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty Black Ops 6 Zombies",
    image: "/images/cod-bo6-zombies.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Warzone Verdansk",
    image: "/images/cod-warzone.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Fortnite: Battle Royale",
    image: "/images/fortnite.jpg",
    platform: "PS5 / Xbox / PC",
  },
  {
    title: "Marvel Rivals",
    image: "/images/marvel-rivals.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Modern Warfare 3",
    image: "/images/cod-mw3.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Black Ops Cold War",
    image: "/images/cod-coldwar.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Vanguard",
    image: "/images/cod-vanguard.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: WWII",
    image: "/images/cod-wwii.jpg",
    platform: "PS4 / Xbox",
  },
  {
    title: "Call of Duty: Black Ops 4",
    image: "/images/cod-bo4.jpg",
    platform: "PS4 / Xbox",
  },
  {
    title: "Call of Duty: Black Ops III",
    image: "/images/cod-bo3.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Ghosts",
    image: "/images/cod-ghosts.png",
    platform: "Cross-Platform",
  },
  {
    title: "Fall Guys: Ultimate Knockout",
    image: "/images/fall-guys.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Modern Warfare Remastered",
    image: "/images/cod-mw-remastered.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Modern Warfare 2",
    image: "/images/cod-mw2.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Modern Warfare",
    image: "/images/cod-mw.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Black Ops II",
    image: "/images/cod-bo2.jpg",
    platform: "PC",
  },
  {
    title: "Call of Duty: Warzone Mobile",
    image: "/images/warzone-mobile.jpeg",
    platform: "Mobile",
  },
  {
    title: "MLB The Show 25",
    image: "/images/mlb25.jpeg",
    platform: "Cross-Platform",
  },
  {
    title: "Madden 25",
    image: "/images/madden25.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "College Football 25",
    image: "/images/college-fb25.png",
    platform: "Cross-Platform",
  },
  {
    title: "NBA 2K25",
    image: "/images/nba2k25.jpeg",
    platform: "Cross-Platform",
  },
  {
    title: "NBA 2K24",
    image: "/images/nba2k24.jpeg",
    platform: "Cross-Platform",
  },
  { title: "FC 25", image: "/images/fc25.jpeg", platform: "Cross-Platform" },
  {
    title: "Call of Duty: Advanced Warfare",
    image: "/images/cod-advanced.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Black Ops",
    image: "/images/cod-bo.jpg",
    platform: "PC",
  },
  {
    title: "Halo Infinite",
    image: "/images/halo.jpg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Infinite Warfare",
    image: "/images/cod-infinite.png",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Modern Warfare 3 (2011)",
    image: "/images/cod-mw3-2011.jpg",
    platform: "PC",
  },
  {
    title: "Call of Duty: Modern Warfare 2 (2009)",
    image: "/images/cod-mw2-2009.jpg",
    platform: "Xbox",
  },
  {
    title: "Call of Duty: Black Ops Cold War Zombies",
    image: "/images/cod-coldwar-zombies.jpeg",
    platform: "Cross-Platform",
  },
  {
    title: "Call of Duty: Blackout",
    image: "/images/cod-blackout.jpg",
    platform: "Cross-Platform",
  },
  { title: "League of Legends", image: "/images/lol.jpeg", platform: "PC" },
  {
    title: "Rogue Company",
    image: "/images/rogue.jpg",
    platform: "Cross-Platform",
  },
  { title: "Gears 5", image: "/images/gears5.jpg", platform: "Xbox" },
  { title: "Clash Royale", image: "/images/clash.jpeg", platform: "Mobile" },
  { title: "Valorant", image: "/images/valorant.jpg", platform: "PC" },
  {
    title: "Rocket League",
    image: "/images/rocket.jpeg",
    platform: "Cross-Platform",
  },
  {
    title: "Apex Legends",
    image: "/images/apex.jpg",
    platform: "Cross-Platform",
  },
];

const getGameImage = (gameName) => {
  const gameImageMap = Object.fromEntries(games.map((g) => [g.title, g.image]));
  return gameImageMap[gameName] || "/images/default.jpg";
};

// 1) Esports home
router.get("/", (req, res, next) => {
  try {
    res.render("egaming/esports", {
      title: "Esports",
      layout: "main",
      games,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Route to show tournaments for a specific game
router.get("/game/:gameName", async (req, res, next) => {
  try {
    const gameName = decodeURIComponent(req.params.gameName);
    // pull in creator.username, sorted by date
    const allTournaments = await Tournament.find({ game: gameName })
      .populate("creator", "username")
      .sort({ date: 1 })
      .lean();

    const now = new Date();
    const upcomingTournaments = []; // includes future + ongoing
    const pastTournaments = []; // fully ended
    let highestPrize = 0;

    // Grab userId if logged in (undefined otherwise)
    const userId = req.user?.userId;

    allTournaments.forEach((t) => {
      // build full Date objects for start & end
      //const dateStr       = t.date.toISOString().split('T')[0];
      // const startDateTime = new Date(`${dateStr}T${t.startTime}`);
      // const endDateTime   = new Date(`${dateStr}T${t.endTime}`);
      const [startHour, startMin] = t.startTime.split(":").map(Number);
      const [endHour, endMin] = t.endTime.split(":").map(Number);
      // build Date() off of t.date (local) rather than toISOString()
      const startDateTime = new Date(t.date);
      startDateTime.setHours(startHour, startMin, 0, 0);
      const endDateTime = new Date(t.date);
      endDateTime.setHours(endHour, endMin, 0, 0);

      // determine state
      const hasStarted = now >= startDateTime;
      const hasEnded = now > endDateTime;
      const isOngoing = hasStarted && !hasEnded;
      const teamCount = Array.isArray(t.teams) ? t.teams.length : 0;
      t.teamCount = teamCount;
      const maxSlots = t.maxTeams || 0;

      // attach flags for template
      t.hasStarted = hasStarted;
      t.hasEnded = hasEnded;
      t.isOngoing = isOngoing;
      t.isCreator = userId && t.creator._id.toString() === userId;
      t.teamCount = (t.teams || []).length;
      // only mark full when you've hit maxTeams AND every team is itself at capacity
      const maxTeams = t.maxTeams || 0;
      const playersPerTeam = parseInt(t.format[0], 10);
      // can still create brand-new teams?
      const canCreate = teamCount < maxTeams;
      // is there at least one team that still has room?
      const hasOpenSlot = (t.teams || []).some(
        (team) =>
          Array.isArray(team.players) && team.players.length < playersPerTeam
      );
      // only truly “full” when neither creating nor joining is possible:
      t.isFull = !canCreate && !hasOpenSlot;

      if (hasEnded) {
        pastTournaments.push(t);
      } else {
        upcomingTournaments.push(t);
        // only consider prize from non‐ended tournaments
        highestPrize = Math.max(highestPrize, t.prizePool?.total || 0);
      }
    });
    const justCreated = req.query.tournamentCreated === "1";
    const justDeleted = req.query.tournamentDeleted === "1";

    res.render("egaming/gameTournaments", {
      title: gameName,
      gameName,
      layout: "main",
      backgroundImage: getGameImage(gameName),
      tournaments: upcomingTournaments,
      pastTournaments,
      highestPrize,
      justCreated,
      justDeleted,
    });
  } catch (err) {
    next(err);
  }
});

// 3) Show Register Team Page
router.get(
  "/:tournamentId/register-team",
  requireAuth,
  async (req, res, next) => {
    try {
      const tournament = await Tournament.findById(req.params.tournamentId)
        .populate("teams.players", "username")
        .populate("creator", "username")
        .lean();
      if (!tournament) return res.status(404).send("Tournament not found.");

      const userId = req.user.userId.toString();
      const playersPerTeam = parseInt(tournament.format[0], 10);
      const maxTeams = tournament.maxTeams;
      const teams = Array.isArray(tournament.teams) ? tournament.teams : [];
      const isCreator = tournament.creator._id.toString() === userId;
      const isAlreadyInTeam = teams.some((team) =>
        team.players.some((p) => p._id.toString() === userId)
      );
      const isTeamLeader =
        isAlreadyInTeam &&
        teams
          .find((team) => team.players.some((p) => p._id.toString() === userId))
          .players[0]._id.toString() === userId;

      // original “canCreate” logic (only if slots remain)
      const canCreate = teams.length < maxTeams;

      // original “canJoin” logic (at least one team has room, and not already in one)
      const baseCanJoin =
        teams.some(
          (team) =>
            Array.isArray(team.players) && team.players.length < playersPerTeam
        ) &&
        !isAlreadyInTeam &&
        !isCreator;

      // ── NEW: time-conflict check ──────────────────────────────────────
      // parse this tournament’s start/end into Date objects
      const [h1, m1] = tournament.startTime.split(":").map(Number);
      const [h2, m2] = tournament.endTime.split(":").map(Number);
      const tDate = new Date(tournament.date);
      const thisStart = new Date(tDate);
      thisStart.setHours(h1, m1, 0, 0);
      const thisEnd = new Date(tDate);
      thisEnd.setHours(h2, m2, 0, 0);

      // fetch all OTHER tournaments where the user is creator or participant
      const occupied = await Tournament.find({
        _id: { $ne: tournament._id },
        $or: [{ creator: userId }, { "teams.players": userId }],
      }).lean();

      // detect any overlap
      let hasTimeConflict = false;
      for (const ot of occupied) {
        if (new Date(ot.date).toDateString() !== tDate.toDateString()) continue;
        const [oh1, om1] = ot.startTime.split(":").map(Number);
        const [oh2, om2] = ot.endTime.split(":").map(Number);
        const otStart = new Date(ot.date);
        otStart.setHours(oh1, om1, 0, 0);
        const otEnd = new Date(ot.date);
        otEnd.setHours(oh2, om2, 0, 0);

        if (thisStart < otEnd && otStart < thisEnd) {
          hasTimeConflict = true;
          break;
        }
      }

      // 4) Check if we were redirected here for overlap
      const overlapError = req.query.overlapError === "1";

      // final canJoin: only if slots remain, no time conflict, and no overlap redirect
      const canJoin = baseCanJoin && !hasTimeConflict && !overlapError;

      // turn overlapError into an actual message for the toast
      const error = overlapError
        ? "You’re already registered in a tournament that overlaps this time."
        : "";

      res.render("egaming/registerTeam", {
        tournament,
        layout: "main",
        title: "Register Team",
        playersPerTeam,
        userId,
        isCreator,
        isAlreadyInTeam,
        isTeamLeader,
        userTeam: teams.find((t) =>
          t.players.some((p) => p._id.toString() === userId)
        ),
        canCreate,
        canJoin,
        error,
        backgroundImage: getGameImage(tournament.game),
      });
    } catch (err) {
      next(err);
    }
  }
);

// 4) Register or join a team
router.post(
  "/:tournamentId/register-team",
  requireAuth,
  async (req, res, next) => {
    try {
      const { action, teamName, teamDescription, joinTeamId } = req.body;
      const tournament = await Tournament.findById(
        req.params.tournamentId
      ).populate("creator");
      if (!tournament) return res.status(404).send("Tournament not found.");

      const userId = req.user.userId.toString();
      const playersPerTeam = parseInt(tournament.format[0], 10);
      const maxTeams = tournament.maxTeams;

      // ─── 1) PREP: build Date objects for this tournament’s start/end ───
      const [h1, m1] = tournament.startTime.split(":").map(Number);
      const [h2, m2] = tournament.endTime.split(":").map(Number);
      const tDate = new Date(tournament.date);
      const thisStart = new Date(tDate);
      thisStart.setHours(h1, m1, 0, 0);
      const thisEnd = new Date(tDate);
      thisEnd.setHours(h2, m2, 0, 0);

      // ─── 2) FETCH all other tournaments the user is in (exclude this one) ───
      const otherTourns = await Tournament.find({
        "teams.players": userId,
        _id: { $ne: tournament._id },
      }).lean();

      // ─── 3) CHECK for any time overlap on the SAME DATE ───
      for (const ot of otherTourns) {
        if (new Date(ot.date).toDateString() !== tDate.toDateString()) continue;
        const [oh1, om1] = ot.startTime.split(":").map(Number);
        const [oh2, om2] = ot.endTime.split(":").map(Number);
        const oStart = new Date(ot.date);
        oStart.setHours(oh1, om1, 0, 0);
        const oEnd = new Date(ot.date);
        oEnd.setHours(oh2, om2, 0, 0);

        // overlap if intervals intersect
        if (thisStart < oEnd && oStart < thisEnd) {
          return res.redirect(
            `/esports/${tournament._id}/register-team?overlapError=1`
          );
        }
      }

      // ─── 4) FOR “create” (team) ACTION: check if creator already hosts a team at this slot ───
      if (action === "create") {
        // disallow the tournament’s own creator from double-booking themself
        if (tournament.creator._id.toString() === userId) {
          // find other tournaments created by this user
          const creatorTourns = await Tournament.find({
            creator: userId,
            _id: { $ne: tournament._id },
          }).lean();

          for (const ct of creatorTourns) {
            if (new Date(ct.date).toDateString() !== tDate.toDateString())
              continue;
            const [ch1, cm1] = ct.startTime.split(":").map(Number);
            const [ch2, cm2] = ct.endTime.split(":").map(Number);
            const cStart = new Date(ct.date);
            cStart.setHours(ch1, cm1);
            const cEnd = new Date(ct.date);
            cEnd.setHours(ch2, cm2);
            if (thisStart < cEnd && cStart < thisEnd) {
              return res
                .status(400)
                .send(
                  "You’ve already created (hosted) a tournament at this same time."
                );
            }
          }
        }
      }

      if (tournament.creator._id.toString() === userId) {
        return res
          .status(403)
          .send("You created this tournament and cannot join.");
      }

      const userTeam = tournament.teams.find((team) =>
        team.players.some((p) => p && p.toString() === userId)
      );
      if (userTeam) {
        const isLeader = userTeam.players[0].toString() === userId;
        if (isLeader) {
          return res
            .status(400)
            .send("As a team leader you cannot create or join another team.");
        }
        return res
          .status(400)
          .send("You are already part of a team in this tournament.");
      }

      if (action === "create") {
        if (tournament.teams.length >= maxTeams) {
          return res.status(400).send("All team slots are full.");
        }
        if (!teamName || teamName.trim().length < 2) {
          return res
            .status(400)
            .send("Team name must be at least 2 characters.");
        }
        if (!teamDescription || teamDescription.trim().length < 5) {
          return res
            .status(400)
            .send("Team description must be 5–200 characters.");
        }
        const normalized = teamName.trim().toLowerCase();
        if (
          tournament.teams.some(
            (t) => t.teamName.trim().toLowerCase() === normalized
          )
        ) {
          return res.status(400).send("Team name already taken.");
        }
        tournament.teams.push({
          teamName: teamName.trim(),
          description: teamDescription.trim(),
          players: [userId],
        });
        await updateKarmaPoints(userId, 10);
      } else if (action === "join") {
        const team = tournament.teams.id(joinTeamId);
        if (!team) return res.status(404).send("Team not found.");
        if (team.players.length >= playersPerTeam) {
          return res.status(400).send("That team is already full.");
        }
        team.players.push(userId);
        await updateKarmaPoints(userId, 10);
      }

      await tournament.save();
      res.redirect(`/esports/${req.params.tournamentId}/register-team`);
    } catch (err) {
      next(err);
    }
  }
);

// Route: POST -> Leave Team
router.post(
  "/:tournamentId/leave-team",
  requireAuth,
  async (req, res, next) => {
    try {
      const tournament = await Tournament.findById(req.params.tournamentId);
      if (!tournament) return res.status(404).send("Tournament not found");

      const userId = req.user.userId.toString();

      // Find the team the user is part of
      const team = tournament.teams.find((team) =>
        team.players.some((p) => p != null && p.toString() === userId)
      );

      if (!team) return res.status(400).send("You are not part of any team");
      // Is the user the team leader?
      const isLeader = team.players[0].toString() === userId;

      if (isLeader) {
        // Leader leaves → delete entire team
        tournament.teams = tournament.teams.filter(
          (t) => t._id.toString() !== team._id.toString()
        );
        // Optionally, deduct karma from remaining members
        for (const member of team.players) {
          if (member.toString() !== userId) {
            await updateKarmaPoints(member.toString(), -10);
          }
        }
      } else {
        // Regular member leaves → remove only that player
        team.players = team.players.filter((p) => p.toString() !== userId);
        // If the team is now empty (just in case), clean it up
        if (team.players.length === 0) {
          tournament.teams = tournament.teams.filter(
            (t) => t._id.toString() !== team._id.toString()
          );
        }
      }

      await updateKarmaPoints(userId, -10);

      await tournament.save();
      res.redirect(`/esports/${req.params.tournamentId}/register-team`);
    } catch (err) {
      next(err);
    }
  }
);

// 6) Remove a member
router.post(
  "/:tournamentId/team/:teamId/remove-member",
  requireAuth,
  async (req, res, next) => {
    try {
      const { tournamentId, teamId } = req.params;
      const { memberId } = req.body;
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) return res.status(404).send("Tournament not found");

      const userId = req.user.userId.toString();
      const team = tournament.teams.id(teamId);
      if (!team) return res.status(404).send("Team not found");

      const isCreator = tournament.creator.toString() === userId;
      const isLeader = team.players[0].toString() === userId;
      if (!isCreator && !isLeader) return res.status(403).send("Forbidden");

      // If we're removing the leader, disband the whole team:
      const leaderId = team.players[0].toString();
      if (memberId === leaderId) {
        // collect all member IDs (including leader)
        const allMemberIds = team.players.map((p) => p.toString());

        // remove the entire team subdocument
        tournament.teams = tournament.teams.filter(
          (t) => t._id.toString() !== teamId
        );

        // deduct karma from everyone who was on that team
        for (const mId of allMemberIds) {
          await updateKarmaPoints(mId, -10);
        }
      } else {
        // Otherwise just remove that one member
        team.players = team.players.filter((p) => p.toString() !== memberId);
        await updateKarmaPoints(memberId, -10);

        // If that was the last member, clean up the empty team
        if (team.players.length === 0) {
          tournament.teams = tournament.teams.filter(
            (t) => t._id.toString() !== teamId
          );
        }
      }

      await tournament.save();
      res.redirect(`/esports/${tournamentId}/register-team`);
    } catch (err) {
      next(err);
    }
  }
);

// 7) Disband a team
router.post(
  "/:tournamentId/team/:teamId/disband",
  requireAuth,
  async (req, res, next) => {
    try {
      const { tournamentId, teamId } = req.params;
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) return res.status(404).send("Tournament not found");

      const userId = req.user.userId.toString();
      const team = tournament.teams.id(teamId);
      if (!team) return res.status(404).send("Team not found");

      const isCreator = tournament.creator.toString() === userId;
      const isLeader = team.players[0].toString() === userId;
      if (!isCreator && !isLeader) return res.status(403).send("Forbidden");

      for (const member of team.players) {
        if (member) await updateKarmaPoints(member.toString(), -10);
      }

      tournament.teams = tournament.teams.filter(
        (t) => t._id.toString() !== teamId
      );
      await tournament.save();
      res.redirect(`/esports/${tournamentId}/register-team`);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE Tournament
router.post("/:tournamentId/delete", requireAuth, async (req, res, next) => {
  try {
    const t = await Tournament.findById(req.params.tournamentId);
    if (!t) {
      return res.status(404).send("Tournament not found.");
    }
    // only the creator can delete
    if (t.creator.toString() !== req.user.userId) {
      return res.status(403).send("Forbidden");
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
