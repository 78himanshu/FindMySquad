import express from "express";
const router = express.Router();
import { checkString } from "../utils/helper.js";
import { gymBuddyData } from "../data/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { ObjectId } from "mongodb";
import { format } from "date-fns";
import Gym from "../models/Gym.js";
import "../models/User.js";

// HOME
router.get("/", (req, res) => {
  res.render("Gym/gym", {
    title: "GymBuddy Home",
    layout: "main",
    head: `<link rel="stylesheet" href="/css/gym.css">`,
    success: req.query.success,
  });
});

// CREATE SESSION
router
  .get("/create", requireAuth, (req, res) => {
    res.render("Gym/createSession", {
      title: "Create Session",
      layout: "main",
      head: `<link rel="stylesheet" href="/css/gym.css">`,
      user: {
        username: req.user.username,
        userId: req.user.userId,
      },
      error: req.query.error,
    });
  })
  .post("/create", requireAuth, async (req, res) => {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Request body cannot be empty" });
    }

    const {
      title,
      gym,
      description,
      sessionDate,
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
      !gym ||
      !sessionDate ||
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
      console.log("Raw inputs:", { sessionDate, startTime, endTime });
    
      checkString(title, "Title");
      checkString(gym, "Gym");
      checkString(gymlocation, "Gym Location");
      checkString(experience, "Experience");
      checkString(workoutType, "Workout Type");
      if (description) checkString(description, "Description");
    
      const now = new Date();
      const parsedSessionDate = new Date(sessionDate);
    
      if (isNaN(parsedSessionDate)) {
        throw new Error("Parsed sessionDate is invalid");
      }
    
      const startDateTime = new Date(`${sessionDate}T${startTime}`);
      const endDateTime = new Date(`${sessionDate}T${endTime}`);
    
      if (isNaN(startDateTime) || isNaN(endDateTime)) {
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
        sessionDate: parsedSessionDate,
      });

      const hasClash = existingSessions.some((s) => {
        const existingStart = new Date(`${s.sessionDate}T${s.startTime}`);
        const existingEnd = new Date(`${s.sessionDate}T${s.endTime}`);
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

      // 🪵 Log inputs for debugging
      console.log("Creating session with:", {
        title,
        gym,
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
        gym,
        description,
        parsedSessionDate,
        startTime,
        endTime,
        gymlocation,
        experience,
        workoutType,
        hostedBy,
        Number(maxMembers)
      );

      return res.redirect("/gymBuddy?success=Session created successfully");
    } catch (e) {
      console.error("🔥 Error creating session:", e);
      return res
        .status(400)
        .json({ error: e?.message || "Failed to create session" });
    }
  });

// FIND SESSIONS
router.get("/find", async (req, res) => {
  try {
    const { experience, workoutType, error, success } = req.query;
    const queryFilters = {};
    if (experience) queryFilters.experience = experience;
    if (workoutType) queryFilters.workoutType = workoutType;

    const now = new Date();
    queryFilters.sessionDate = { $gte: now };

    const rawSessions = await Gym.find(queryFilters)
      .populate("hostedBy", "username")
      .populate("members", "username");

    const sessions = rawSessions.map((session) => {
      const obj = session.toObject();
      const dateToFormat = session.sessionDate;
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
        req.user && session.hostedBy._id.toString() === req.user.userId;
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
      success,
    });
  } catch (e) {
    console.error("🔥 Error in /find:", e);
    res.status(500).render("error", { message: "Something went wrong" });
  }
});


export default router;
