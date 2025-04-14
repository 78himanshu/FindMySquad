import express from "express";
const router = express.Router();
import { checkString } from "../utils/Helper.js";
import { gymBuddyData } from "../data/index.js";

router.get("/", (req, res) => {
  res.render("Gym/gym", {
    title: "GymBuddy Home",
    layout: "main",
    head: `<link rel="stylesheet" href="/css/gym.css">`,
  });
});

// CREATE a new gym session
router;
router
  .get("/create", (req, res) => {
    res.render("Gym/createSession", {
      title: "Create Gym Session",
      layout: "main",
      head: `<link rel="stylesheet" href="/css/gym.css">`,
    });
  })
  .post("/create", async (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Request body cannot be empty" });
    }

    const {
      title,
      venue,
      description,
      dateTime,
      gymlocation,
      skillLevel,
      workoutType,
      hostedBy,
    } = data;

    if (
      !title ||
      !venue ||
      !dateTime ||
      !gymlocation ||
      !skillLevel ||
      !workoutType ||
      !hostedBy
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    try {
      checkString(title, "Title");
      checkString(venue, "Venue");
      checkString(gymlocation, "Gym Location");
      checkString(skillLevel, "Skill Level");
      checkString(workoutType, "Workout Type");
      if (description) checkString(description, "Description");
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    try {
      const created = await gymBuddyData.createGymSession(
        title,
        venue,
        description,
        dateTime,
        gymlocation,
        skillLevel,
        workoutType,
        hostedBy
      );
      return res.status(200).json(created);
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
