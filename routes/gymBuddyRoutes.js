import express from "express";
const router = express.Router();
import { checkString } from "../utils/helper.js";
import { gymBuddyData } from "../data/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { ObjectId } from "mongodb";
import { format } from "date-fns";
import Gym from "../models/Gym.js";
import { updateKarmaPoints } from "../utils/karmaHelper.js";

// Home
router.get("/", (req, res) => {
  res.render("Gym/gym", {
    title: "GymBuddy Home",
    layout: "main",
    head: `<link rel="stylesheet" href="/css/gym.css">`,
    profileCompleted: req.user?.profileCompleted || false,
    success: req.query.success,
  });
});

// create session
router
  .get("/create", requireAuth, (req, res) => {
    res.render("Gym/createSession", {
      title: "Create Gym Session",
      layout: "main",
      head: `<link rel="stylesheet" href="/css/gym.css">`,
      user: {
        username: req.user.username,
        userId: req.user.userId,
      },
      profileCompleted: req.user?.profileCompleted || false,
      error: req.query.error,
    });
  })
  .post("/create", requireAuth, async (req, res) => {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Request body cannot be empty" });
    }

    console.log("data", data);
    const {
      title,
      gymName,
      description,
      date,
      startTime,
      endTime,
      gymlocation,
      experience,
      workoutType,
      hostedBy,
      maxMembers,
    } = data;

    if (!ObjectId.isValid(hostedBy)) {
      return res.status(400).json({ error: "Invalid hostedBy ID" });
    }

    const allowed = ["1", "2", "3", "4"];
    if (!allowed.includes(String(maxMembers))) {
      return res.status(400).json({ error: "Invalid maxMembers value" });
    }

    if (
      !title ||
      !gymName ||
      !date ||
      !startTime ||
      !endTime ||
      !gymlocation ||
      !experience ||
      !workoutType
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    try {
      // Log date & time inputs
      console.log("Raw inputs:", { date, startTime, endTime });

      checkString(title, "Title");
      checkString(gymName, "Gym Name");
      checkString(gymlocation, "Gym Location");
      checkString(experience, "Experience");
      checkString(workoutType, "Workout Type");
      if (description) checkString(description, "Description");

      const now = new Date();
      const parsedSessionDate = new Date(date);

      const paddedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
      const paddedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

      const startDateTime = new Date(`${date}T${paddedStartTime}`);
      const endDateTime = new Date(`${date}T${paddedEndTime}`);

      if (
        isNaN(parsedSessionDate.getTime()) ||
        isNaN(startDateTime.getTime()) ||
        isNaN(endDateTime.getTime())
      ) {
        throw new Error("Invalid Date or Time format.");
      }

      if (parsedSessionDate < now) {
        return res
          .status(400)
          .json({ error: "Session date must be in the future." });
      }

      if (startDateTime < now) {
        return res
          .status(400)
          .json({ error: "Session start time must be in the future." });
      }

      if (startDateTime >= endDateTime) {
        return res
          .status(400)
          .json({ error: "End Time must be after Start Time." });
      }

      const existingSessions = await Gym.find({
        $or: [{ hostedBy }, { members: hostedBy }],
        date: parsedSessionDate,
      });

      const hasClash = existingSessions.some((s) => {
        const sPaddedStart = s.startTime.length === 5 ? `${s.startTime}:00` : s.startTime;
        const sPaddedEnd = s.endTime.length === 5 ? `${s.endTime}:00` : s.endTime;
        const existingStart = new Date(`${s.date}T${sPaddedStart}`);
        const existingEnd = new Date(`${s.date}T${sPaddedEnd}`);
        return (
          (startDateTime >= existingStart && startDateTime < existingEnd) ||
          (endDateTime > existingStart && endDateTime <= existingEnd) ||
          (startDateTime <= existingStart && endDateTime >= existingEnd)
        );
      });

      if (hasClash) {
        return res.redirect(
          `/gymBuddy/create?error=${encodeURIComponent(
            "You already have a session within 1 hour of this time."
          )}`
        );
      }

      // Log inputs for debugging
      console.log("Creating session with:", {
        title,
        gymName,
        description,
        parsedSessionDate,
        startTime,
        endTime,
        gymlocation,
        experience,
        workoutType,
        hostedBy,
        maxMembers,
      });

      await gymBuddyData.createGymSession(
        title,
        gymName,
        description,
        date,
        paddedStartTime,
        paddedEndTime,
        gymlocation,
        experience,
        workoutType,
        hostedBy,
        Number(maxMembers)
      );

      return res.json({
        success: true,
        message: "Session created successfully",
        redirectUrl: "/gymBuddy/mySessions",
      });

      // return res.redirect("/gymBuddy?success=Session created successfully");
    } catch (e) {
      console.error("🔥 Error creating session:", e);
      return res
        .status(400)
        .json({ error: e?.message || "Failed to create session" });
    }
  });


// find session
router.get("/find", async (req, res) => {
  const { experience, workoutType, error, success } = req.query;
  const queryFilters = {};
  if (experience && experience.trim() !== "") {
    queryFilters.experience = experience;
  }
  if (workoutType && workoutType.trim() !== "") {
    queryFilters.workoutType = workoutType;
  }

  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  queryFilters.date = { $gte: todayStr };

  const rawSessions = await Gym.find(queryFilters)
    .populate({ path: "hostedBy", model: "Userlist", select: "username" })
    .populate({ path: "members", model: "Userlist", select: "username" });

  const sessions = rawSessions.map((session) => {
    const obj = session.toObject();
    const dateToFormat = `${session.date}T${session.startTime}`;
    try {
      obj.formattedDateTime = format(
        new Date(dateToFormat),
        "eee MMM dd, yyyy h:mm a"
      );
    } catch {
      obj.formattedDateTime = "Invalid Date";
    }

    obj.currentMembers = session.members.length;
    obj.maxMembers = session.maxMembers;
    obj.members = session.members.map((m) => ({
      _id: m._id,
      username: m.username,
    }));
    obj.hasJoined = req.user
      ? session.members.some((m) => m._id.toString() === req.user.userId)
      : false;
    obj.isHost =
      req.user &&
      session.hostedBy &&
      session.hostedBy._id &&
      session.hostedBy._id.toString() === req.user.userId;
    obj.isLoggedIn = !!req.user;
    return obj;
  });

  res.render("Gym/findBuddies", {
    title: "Find Workout Buddies",
    layout: "main",
    head: `<link rel="stylesheet" href="/css/gym.css">`,
    sessions,
    currentExperience: experience || "",
    currentWorkoutType: workoutType || "",
    isLoggedIn: res.locals.isLoggedIn,
    error,
    profileCompleted: req.user?.profileCompleted || false,
    success
  });
});

// for joining the gym session
router.post("/join/:id", requireAuth, async (req, res) => {
  const sessionId = req.params.id;
  const userId = req.user.userId;

  try {
    const sessionToJoin = await Gym.findById(sessionId);

    if (!sessionToJoin) throw "Session not found";

    if (sessionToJoin.hostedBy.toString() === userId) {
      return res.redirect(
        "/gymBuddy/find?error=You cannot join your own session"
      );
    }

    if (sessionToJoin.members.includes(userId)) {
      return res.redirect(
        "/gymBuddy/find?error=You already joined this session"
      );
    }

    //  Check for time clash (±1 hour with user's other sessions)
    const userSessions = await Gym.find({
      $or: [{ members: userId }, { hostedBy: userId }],
    });

    const targetTime = new Date(
      `${sessionToJoin.date}T${sessionToJoin.startTime}`
    );

    const hasClash = userSessions.some((s) => {
      const existingTime = new Date(`${s.date}T${s.startTime}`);
      const diffMinutes = Math.abs(targetTime - existingTime) / (1000 * 60); // convert ms to mins
      return diffMinutes < 60; // clash if within 1 hour
    });

    if (hasClash) {
      return res.redirect(
        "/gymBuddy/find?error=You already have a session within 1 hour of this one."
      );
    }

    if (sessionToJoin.currentMembers >= sessionToJoin.maxMembers) {
      return res.redirect("/gymBuddy/find?error=Session is full");
    }

    sessionToJoin.members.push(userId);
    sessionToJoin.currentMembers = sessionToJoin.members.length;

    await updateKarmaPoints(userId, 10);

    await sessionToJoin.save();

    return res.redirect("/gymBuddy/find?success=Joined successfully");
  } catch (e) {
    return res.redirect(
      `/gymBuddy/find?error=${encodeURIComponent(e.message || e)}`
    );
  }
});

// leave the session
router.post("/leave/:id", requireAuth, async (req, res) => {
  const sessionId = req.params.id;
  const userId = req.user.userId;

  try {
    const session = await Gym.findById(sessionId);
    if (!session) throw "Session not found";

    session.members = session.members.filter(
      (member) => member.toString() !== userId
    );
    session.currentMembers = session.members.length;

    await updateKarmaPoints(userId, -10);

    await session.save();

    return res.redirect("/gymBuddy/find?success=Left session successfully");
  } catch (e) {
    return res.redirect(
      `/gymBuddy/find?error=${encodeURIComponent(e.message || e)}`
    );
  }
});

// find my sessions
router.get("/mySessions", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const allSessions = await Gym.find()
      .populate({
        path: "hostedBy",
        model: "Userlist",
        select: "username",
      })
      .populate({
        path: "members",
        model: "Userlist",
        select: "username",
      });

    const now = new Date();
    const hostedSessions = [];
    const joinedSessions = [];

    allSessions.forEach((session) => {
      try {
        if (!session || !session.startTime || !session.date) return;

        const paddedTime =
          session.startTime.length === 5
            ? `${session.startTime}:00`
            : session.startTime;
        const sessionStart = new Date(`${session.date}T${paddedTime}`);

        if (sessionStart >= now) {
          const sessionObj = session.toObject();

          sessionObj.formattedDateTime = format(
            sessionStart,
            "eee MMM dd, yyyy h:mm a"
          );

          const membersArray = Array.isArray(session.members)
            ? session.members
            : [];

          sessionObj.currentMembers = membersArray.length;
          sessionObj.maxMembers = session.maxMembers || 0;

          sessionObj.members = membersArray
            .filter((m) => m && m.username)
            .map((m) => ({ username: m.username }));

          const isHost = session.hostedBy?._id?.toString() === userId;
          const isJoined = membersArray.some(
            (m) => m?._id?.toString() === userId
          );

          if (isHost) {
            hostedSessions.push(sessionObj);
          } else if (isJoined) {
            joinedSessions.push(sessionObj);
          }
        }
      } catch (innerErr) {
        console.warn(" Skipping malformed session:", innerErr);
      }
    });

    res.render("Gym/mySessions", {
      title: "My Sessions",
      layout: "main",
      head: `<link rel="stylesheet" href="/css/gym.css">`,
      username: req.user.username,
      hostedSessions,
      joinedSessions,
      profileCompleted: req.user?.profileCompleted || false,
      isLoggedIn: true,
    });
  } catch (e) {
    console.error("Error in /mySessions:", e);
    res.status(500).render("error", { message: "Something went wrong" });
  }
});

// edit my sessions
router.get("/edit/:id", requireAuth, async (req, res) => {
  try {
    const session = await Gym.findById(req.params.id)
      .populate("hostedBy", "username")
      .lean();

    if (!session) {
      return res.status(404).render("error", { error: "Session not found" });
    }

    if (session.hostedBy._id.toString() !== req.user.userId) {
      return res.status(403).render("error", { error: "Unauthorized access" });
    }

    res.render("Gym/createSession", {
      layout: "main",
      title: "Edit Gym Session",
      head: `<link rel="stylesheet" href="/css/gym.css">`,
      isEditMode: true,
      sessionId: session._id.toString(),
      ...session,
      date: session.date,
      startTime:
        session.startTime.length === 5
          ? `${session.startTime}:00`
          : session.startTime,
      endTime:
        session.endTime.length === 5
          ? `${session.endTime}:00`
          : session.endTime,
      maxMembers: session.maxMembers?.toString(),
      user: {
        userId: session.hostedBy._id.toString(),
        username: session.hostedBy.username,
      },
    });
  } catch (e) {
    console.error("Error loading edit page:", e);
    res.status(500).render("error", { message: "Something went wrong" });
  }
});

router.post("/update/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).render("error", { message: "Invalid session ID" });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res
      .status(400)
      .render("error", { message: "No update fields provided" });
  }

  try {
    const session = await Gym.findById(id);

    if (!session) {
      return res.status(404).render("error", { message: "Session not found" });
    }

    if (session.hostedBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .render("error", { message: "Unauthorized to update this session" });
    }

    const allowedFields = [
      "title",
      "gym",
      "description",
      "date",
      "startTime",
      "endTime",
      "gymlocation",
      "experience",
      "workoutType",
      "maxMembers",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        session[field] = updates[field];
      }
    });

    await session.save();
    return res.json({
      success: true,
      message: "Session updated successfully",
      redirectUrl: "/gymBuddy/mySessions",
    });
  } catch (e) {
    console.error("🔥 Error updating session:", e);
    res.status(500).render("error", { message: "Internal server error" });
  }
});

// Delete Gym Session
router.post("/delete/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).render("error", { message: "Invalid session ID" });
  }

  try {
    const session = await Gym.findById(id);

    if (!session) {
      return res.status(404).render("error", { message: "Session not found" });
    }

    if (session.hostedBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .render("error", { message: "Unauthorized to delete this session" });
    }

    await Gym.deleteOne({ _id: id });
    res.redirect("/gymBuddy/mySessions");
  } catch (e) {
    console.error("Error deleting session:", e);
    res.status(500).render("error", { message: "Internal server error" });
  }
});

// View session details
router.get("/find/:id", async (req, res) => {
  const sessionId = req.params.id;

  try {
    const session = await Gym.findById(sessionId)
      .populate({ path: "hostedBy", model: "Userlist", select: "username" })
      .populate({ path: "members", model: "Userlist", select: "username" });

    if (!session) {
      return res.status(404).render("error", { error: "Session not found" });
    }

    const userId = req.user?.userId;
    const isLoggedIn = !!userId;

    const isHost =
      isLoggedIn &&
      session.hostedBy &&
      session.hostedBy._id.toString() === userId;

    const hasJoined =
      isLoggedIn && session.members.some((m) => m._id.toString() === userId);

    const sessionObj = session.toObject();
    const dateToFormat = `${session.date}T${session.startTime}`;
    try {
      sessionObj.formattedDateTime = format(
        new Date(dateToFormat),
        "eee MMM dd, yyyy h:mm a"
      );
    } catch {
      sessionObj.formattedDateTime = "Invalid Date";
    }

    sessionObj.currentMembers = session.members.length;
    sessionObj.maxMembers = session.maxMembers;
    sessionObj.members = session.members.map((m) => ({
      _id: m._id,
      username: m.username,
    }));

    res.render("Gym/sessionDetails", {
      title: session.title,
      layout: "main",
      head: `<link rel="stylesheet" href="/css/gym.css">`,
      session: sessionObj,
      isLoggedIn,
      isHost,
      hasJoined,
      username: req.user?.username || "",
    });
  } catch (e) {
    console.error("Error in /gymBuddy/find/:id:", e);
    return res.status(500).render("error", {
      error: "An unknown error occurred.",
    });
  }
});

export default router;
