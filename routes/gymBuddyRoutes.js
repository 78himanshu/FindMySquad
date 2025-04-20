import express from "express";
const router = express.Router();
import { checkString } from "../utils/Helper.js";
import { gymBuddyData } from "../data/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { ObjectId } from "mongodb";
import { format } from "date-fns";
import Gym from "../models/Gym.js";
// In gymBuddyRoutes.js or index.js
import "../models/User.js";


router.get("/", (req, res) => {
  res.render("Gym/gym", {
    title: "GymBuddy Home",
    layout: "main",
    head: `<link rel="stylesheet" href="/css/gym.css">`,
    success: req.query.success 
  });
});

// CREATE a new gym session
router;
router
  .get("/create",requireAuth, (req, res) => {
    res.render("Gym/createSession", {
      title: "Create Gym Session",
      layout: "main",
      head: `<link rel="stylesheet" href="/css/gym.css">`,
      user: {
        username: req.user.username,
        userId: req.user.userId
      },
      error: req.query.error // passing error
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
      dateTime,
      gymlocation,
      experience,
      workoutType,
      hostedBy,
      maxMembers
    } = data;
  
    if (!ObjectId.isValid(hostedBy)) {
      return res.status(400).json({ error: "Invalid hostedBy ID" });
    }
  
    if (!["1", "2", "3", "4"].includes(maxMembers)) {
      return res.status(400).json({ error: "Invalid maxMembers value" });
    }
  
    const now = new Date();
    const sessionDate = new Date(dateTime);
    if (sessionDate < now) {
      return res.status(400).json({ error: "Session date and time must be in the future." });
    }
  
    if (!title || !gym || !dateTime || !gymlocation || !experience || !workoutType) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }
  
    try {
      checkString(title, "Title");
      checkString(gym, "Venue");
      checkString(gymlocation, "Gym Location");
      checkString(experience, "Skill Level");
      checkString(workoutType, "Workout Type");
      if (description) checkString(description, "Description");
  
      // Time clash check here
      const newSessionTime = new Date(dateTime);
  
      const existingSessions = await Gym.find({
        $or: [
          { hostedBy: hostedBy },
          { members: hostedBy }
        ]
      });
  
      const hasClash = existingSessions.some(s => {
        const existingTime = new Date(s.dateTime);
        const diffInMinutes = Math.abs(newSessionTime - existingTime) / (1000 * 60);
        return diffInMinutes < 60;
      });
  
      if (hasClash) {
        return res.redirect(`/gymBuddy/create?error=${encodeURIComponent("You already have a session within 1 hour of this time.")}`);
      }
  
      // ✅ All good — create the session
      await gymBuddyData.createGymSession(
        title,
        gym,
        description,
        dateTime,
        gymlocation,
        experience,
        workoutType,
        hostedBy,
        maxMembers
      );
  
      return res.redirect("/gymBuddy?success=Session created successfully");
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });  

// UPDATE a gym session by ID
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No update fields provided" });
  }

  try {
    const updated = await gymBuddyData.updateGymSession(id, updates);
    return res.status(200).json(updated);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// DELETE a gym session by ID
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await gymBuddyData.deleteGymSession(id);
    return res
      .status(200)
      .json({ message: "Gym session deleted successfully", deleted });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});
export default router;
// for find session
router.get("/find", async (req, res) => {
   // Build filter criteria from query parameters
   const { experience, workoutType, error, success } = req.query;
   const queryFilters = {};
   
   if (experience && experience !== "") {
     queryFilters.experience = experience;
   }
   
   if (workoutType && workoutType !== "") {
     queryFilters.workoutType = workoutType;
   }

  const now = new Date();
  queryFilters.dateTime = { $gte: now };
  let rawSessions = [];
    rawSessions = await Gym.find(queryFilters).populate({
      path: 'hostedBy',
      model: 'Userlist',
      select: 'username'
    }).populate({
      path: 'members',
      model: 'Userlist',
      select: 'username'
    });
    //rawSessions = await gymBuddyData.getAllGymSessions();
   // Convert Mongoose documents to plain JS objects
   const sessions = rawSessions.map(session =>{
    const obj = session.toObject();
    obj.formattedDateTime = format(new Date(session.dateTime), "eee MMM dd, yyyy h:mm a");

    obj.currentMembers = session.members.length; 
    obj.maxMembers = session.maxMembers;
    obj.members = session.members.map(member => ({ username: member.username }));
    obj.hasJoined = req.user ? session.members.some(m => m._id.toString() === req.user.userId) : false;
    obj.isHost = req.user && session.hostedBy._id.toString() === req.user.userId;

    if (req.user) {
      const currentUserId = req.user.userId;
      obj.hasJoined = session.members.some(
        m => m._id.toString() === currentUserId
      );
      obj.isLoggedIn = true;
    } else {
      obj.hasJoined = false;
      obj.isLoggedIn = false;
    }
    return obj;
  });


  res.render("Gym/findBuddies", {
    title: "Find Workout Buddies",
    layout: "main",
    head: `<link rel="stylesheet" href="/css/gym.css">`,
    sessions,
    // Pass along current filter values (so the form can re-select them)
    currentExperience: experience || "",
    currentWorkoutType: workoutType || "",
    isLoggedIn: res.locals.isLoggedIn,
    error,
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
      return res.redirect("/gymBuddy/find?error=You cannot join your own session");
    }

    if (sessionToJoin.members.includes(userId)) {
      return res.redirect("/gymBuddy/find?error=You already joined this session");
    }

    //  Check for time clash (±1 hour with user's other sessions)
    const userSessions = await Gym.find({
      $or: [
        { members: userId },
        { hostedBy: userId }
      ]
    });

    const targetTime = new Date(sessionToJoin.dateTime);

    const hasClash = userSessions.some(s => {
      const existingTime = new Date(s.dateTime);
      const diffMinutes = Math.abs(targetTime - existingTime) / (1000 * 60); // convert ms to mins
      return diffMinutes < 60; // clash if within 1 hour
    });

    if (hasClash) {
      return res.redirect("/gymBuddy/find?error=You already have a session within 1 hour of this one.");
    }

    if (sessionToJoin.currentMembers >= sessionToJoin.maxMembers) {
      return res.redirect("/gymBuddy/find?error=Session is full");
    }

    sessionToJoin.members.push(userId);
    sessionToJoin.currentMembers = sessionToJoin.members.length;

    await sessionToJoin.save();

    return res.redirect("/gymBuddy/find?success=Joined successfully");
  } catch (e) {
    return res.redirect(`/gymBuddy/find?error=${encodeURIComponent(e.message || e)}`);
  }
});

router.post("/leave/:id", requireAuth, async (req, res) => {
  const sessionId = req.params.id;
  const userId = req.user.userId;

  try {
    const session = await Gym.findById(sessionId);
    if (!session) throw "Session not found";

    session.members = session.members.filter(member => member.toString() !== userId);
    session.currentMembers = session.members.length;

    await session.save();

    return res.redirect("/gymBuddy/find?success=Left session successfully");
  } catch (e) {
    return res.redirect(`/gymBuddy/find?error=${encodeURIComponent(e.message || e)}`);
  }
});

router.get("/mySessions", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const allSessions = await Gym.find({ dateTime: { $gte: new Date() } })
      .populate({
        path: 'hostedBy',
        model: 'Userlist',
        select: 'username'
      })
      .populate({
        path: 'members',
        model: 'Userlist',
        select: 'username'
      });

    const hostedSessions = [];
    const joinedSessions = [];

    allSessions.forEach(session => {
      const sessionObj = session.toObject();
      sessionObj.formattedDateTime = format(new Date(session.dateTime), "eee MMM dd, yyyy h:mm a");
      sessionObj.currentMembers = session.members.length;
      sessionObj.maxMembers = session.maxMembers;
      sessionObj.members = session.members.map(member => ({ username: member.username }));

      const isHost = session.hostedBy._id.toString() === userId;
      const isJoined = session.members.some(m => m._id.toString() === userId);

      if (isHost) {
        hostedSessions.push(sessionObj);
      } else if (isJoined) {
        joinedSessions.push(sessionObj);
      }
    });

    res.render("Gym/mySessions", {
      title: "My Sessions",
      layout: "main",
      head: `<link rel="stylesheet" href="/css/gym.css">`,
      username: req.user.username,
      hostedSessions,
      joinedSessions,
      isLoggedIn: true
    });
  } catch (e) {
    console.error(e);
    res.status(500).render("error", { message: "Failed to load your sessions" });
  }
});

router.get('/edit/:id', requireAuth, async (req, res) => {
  const session = await Gym.findById(req.params.id).populate('hostedBy', 'username').lean();
  if (!session) return res.redirect('/gymBuddy/mySessions');

  const sessionDate = new Date(session.dateTime); // UTC time from DB
  const now = new Date(); // Current time in server environment
  const diffHrs = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);


  if (session.hostedBy.toString() !== req.user.userId && diffHrs < 6) {
    return res.redirect('/gymBuddy/mySessions?error=Unauthorized or time-restricted');
  }

  res.render("Gym/createSession", {
    layout: "main",
    title: "Edit Gym Session",
    head: `<link rel="stylesheet" href="/css/gym.css">`,
    isEditMode: true,
    ...session, // spread all fields
    dateTime: format(new Date(session.dateTime), "yyyy-MM-dd'T'HH:mm"),
    maxMembers: session.maxMembers?.toString(),
    user: {
      userId: session.hostedBy._id.toString(),
      username: session.hostedBy.username
    }    
  });
});

