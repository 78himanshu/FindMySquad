import express from "express";
import { Router } from "express";
import { userProfileData, joinGameData, gymBuddyData } from "../data/index.js";
import verifyToken from "../middleware/auth.js";
import { checkString } from "../utils/helper.js";
import Userlist from "../models/User.js";
import mongoose from "mongoose";
// import { userProfileData } from "../data/index.js";
import UserProfile from "../models/userProfile.js";
const ObjectId = mongoose.Types.ObjectId;
//import { geocodeCity } from '../utils/geocode.js';
import { format } from "date-fns";
import axios from "axios";
import xss from 'xss';

const router = Router();

// -----------------------------------------
// API Routes - For frontend AJAX / Postman use
// -----------------------------------------
router
  .route("/")
  .get(verifyToken, async (req, res) => {
    console.log("Rendering edit view");
    try {
      const profile = await userProfileData.getProfile(req.user.userID);
      res.status(200).json(profile);
    } catch (e) {
      res.status(404).json({ error: e.toString() });
    }
  })
  .post(verifyToken, async (req, res) => {
    try {
      const firstName = xss(req.body.firstName).trim();
      const lastName = xss(req.body.lastName).trim();
      const bio = xss(req.body.bio || "").trim();
      const gender = xss(req.body.gender).trim();
      const profilePic = xss(req.body.profilePic).trim();
      const city = xss(req.body.city || "").trim();
      const phoneNumber = xss(req.body.phoneNumber || "").trim();

      const sportsInterests = req.body.sportsInterests.map(i => xss(i.trim()));
      const gymPreferences = req.body.gymPreferences.map(i => xss(i.trim()));
      const gamingInterests = req.body.gamingInterests.map(i => xss(i.trim()));

      console.log(">>>", req.body);

      if (
        !firstName ||
        !lastName ||
        !gender ||
        !profilePic ||
        !sportsInterests ||
        !gymPreferences ||
        !gamingInterests
      ) {
        return res.status(400).json({ error: "All fields are requiredddd" });
      }

      checkString(firstName, "firstName");
      checkString(lastName, "lastName");
      checkString(gender, "gender");
      checkString(profilePic, "profilePic");
      sportsInterests.forEach((interest) =>
        checkString(interest, "sportsInterests")
      );
      gymPreferences.forEach((preference) =>
        checkString(preference, "gymPreferences")
      );
      gamingInterests.forEach((interest) =>
        checkString(interest, "gamingInterests")
      );

      //const geoLocation = await geocodeCity(city);

      let profileData = {
        profile: {
          firstName,
          lastName,
          gender,
          bio,
          avatar: profilePic,
        },
        sportsInterests,
        gymPreferences,
        gamingInterests,
        city,
        phoneNumber,
        //geoLocation
      };

      const profile = await userProfileData.createProfile(
        req.user.userID,
        profileData
      );

      res.status(201).json(profile);
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  })
  .put(verifyToken, async (req, res) => {
    try {
      const userId = req.user.userID;
      const { profile, location } = req.body;

      if (!userId || !profile) {
        return res.status(400).json({ error: "Missing data" });
      }

      const updateData = {
        profile: {
          firstName: profile.firstName?.trim(),
          lastName: profile.lastName?.trim(),
          bio: profile.bio?.trim(),
          gender: profile.gender || "",
        },
        phoneNumber: profile.phoneNumber || "",
        location: {
          city: location?.city?.trim() || "",
          // You can extend this to include state, zipCode, etc.
        },
      };

      const encodedLoc = encodeURIComponent(updateData.location.city);
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      const geoRes = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLoc}&key=${apiKey}`
      );

      if (
        !geoRes.data ||
        !geoRes.data.results ||
        !geoRes.data.results[0]?.geometry?.location
      ) {
        return res
          .status(400)
          .json({
            error: "Invalid city address, could not get location coordinates.",
          });
      }
      const { lat, lng } = geoRes.data.results[0].geometry.location;
      updateData.location.geoLocation = {
        type: "Point",
        coordinates: [lng, lat],
      };

      const updated = await userProfileData.updateProfile(userId, updateData);

      if (!updated) {
        return res.status(404).json({ error: "Profile not updated" });
      }

      return res.json({
        success: true,
        message: "Profile updated",
        data: updated,
      });
    } catch (err) {
      console.error("Edit profile error:", err);
      res.status(500).json({ error: "Server error" });
    }
  })
  .delete(verifyToken, async (req, res) => {
    try {
      await userProfileData.deleteProfile(req.user.userID);
      res.status(200).json({ message: "Profile deleted successfully" });
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  });

// -----------------------------------------
// View Route - Render UserProfile Frontend Page
// -----------------------------------------
router.route("/view").get(verifyToken, async (req, res) => {
  try {
    const profile = await userProfileData.getProfile(req.user.userID);
    const isOwn = true; // Important: mark as your own
    const isFollowing = false; // You can't follow yourself

    res.render("userProfile/view", {
      title: "Your Profile",
      layout: "main",
      firstName: profile.profile.firstName,
      lastName: profile.profile.lastName,
      gender: profile.profile.gender,
      email: profile.userId.email,
      username: profile.userId.username,
      userId: profile.userId._id,
      bio: profile.profile.bio,
      avatar: profile.profile.avatar || "/images/default-avatar.png",
      sportsInterests: profile.sportsInterests,
      gymPreferences: profile.gymPreferences,
      gamingInterests: profile.gamingInterests,
      location: profile.location,
      karmaPoints: profile.karmaPoints,
      followers: profile.followers,
      following: profile.following,
      averageRating: profile.averageRating,
      ratingCount: profile.ratingCount,
      phoneNumber: profile.phoneNumber,
      city: profile.location?.city || "",
      ratings: profile.ratings,
      isOwn, // 👈 pass true
      isFollowing, // 👈 pass false
      head: `<link rel="stylesheet" href="/css/userProfile.css">`,
    });
  } catch (e) {
    res.status(404).render("error", { error: e.toString() });
  }
});
// -----------------------------------------
// Edit Profile Routes - Render Edit Form & Process Updates
// -----------------------------------------
router
  .route("/edit")
  .get(verifyToken, async (req, res) => {
    try {
      const profile = await userProfileData.getProfile(req.user.userID);
      res.render("userProfile/edit", {
        title: "Edit Profile",
        layout: "main",
        firstName: profile.profile.firstName,
        lastName: profile.profile.lastName,
        bio: profile.profile.bio,
        avatar: profile.profile.avatar,
        city: profile.location?.city || "",
        state: profile.location?.state || "",
        zipCode: profile.location?.zipCode || "",
        head: `<link rel="stylesheet" href="/css/editProfile.css">`,
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      });
    } catch (e) {
      res.status(404).render("error", { error: e.toString() });
    }
  })
  .post(verifyToken, async (req, res) => {
    try {
      const updated = await userProfileData.updateProfile(
        req.user.userID,
        req.body
      );
      res.redirect("/api/profile/view?success=Profile updated successfully");
    } catch (e) {
      res.status(400).render("error", { error: e.toString() });
    }
  });

router.route("/addprofile").get(verifyToken, async (req, res) => {
  // console.log("req", req)
  res.render("userProfile/complete-profile", {
    title: "Complete Profile",
    layout: "main",
    disableNav: true,
    error: req.query.error,
    username: req.username || null || "",
    email: req.query.email || "",
    head: `
        <link rel="stylesheet" href="/css/signup.css">
        <link rel="stylesheet" href="/css/modal.css">
        <link rel="stylesheet" href="/css/styles.css">
      `,
    layout: "main",
    sportsList: [
      "Soccer",
      "Basketball",
      "Baseball",
      "Tennis",
      "Swimming",
      "Running",
      "Cycling",
      "Hiking",
      "Golf",
      "Volleyball",
    ],
    workoutTypes: [
      "Cardio",
      "Weight Training",
      "CrossFit",
      "Yoga",
      "HIIT",
      "Pilates",
      "Zumba",
      "Bodyweight",
    ],
    gamingOptions: [
      "FPS (e.g., Call of Duty)",
      "Battle Royale (e.g., Fortnite)",
      "MOBA (e.g., Dota 2)",
      "Sports (e.g., FIFA)",
      "Racing (e.g., Forza)",
      "Simulation (e.g., Sims)",
      "RPG (e.g., Elden Ring)",
      "MMORPG",
      "Strategy",
      "Puzzle",
    ],
  });
});

// ————— Show All Bookings Page ——————

router.get("/bookings", verifyToken, async (req, res) => {
  const userId = req.user.userID;

  try {
    const allGameBookings = await joinGameData.getJoinedGamesByUser(userId);
    const allGymBookings = await gymBuddyData.getJoinedSessionsByUser(userId);
    const now = new Date();

    const allGameBookingsEnriched = await Promise.all(
      allGameBookings.map(async (game) => {
        const enrichedPlayers = await Promise.all(
          game.players.map(async (pid) => {
            const user = await Userlist.findById(pid).select("username");
            const profile = await UserProfile.findOne({ userId: pid });

            const existingRating = profile?.ratings?.find(
              (r) =>
                r.rater.toString() === userId.toString() &&
                r.bookingId.toString() === game._id.toString()
            );

            return {
              _id: pid.toString(),
              username: user ? user.username : "Unknown",
              hasBeenRated: !!existingRating,
              ratedScore: existingRating?.score || 0,
              review: existingRating?.review || ""
            };
          })
        );


        const formattedDateTime = game.startTime
          ? format(new Date(game.startTime), "eee MMM dd, yyyy h:mm a")
          : "Invalid Date";

        return {
          ...game.toObject(),
          players: enrichedPlayers,
          host: game.host.toString(),
          formattedDateTime,
        };
      })
    );

    const pastGameBookings = allGameBookingsEnriched.filter(
      (game) => new Date(game.endTime) < now
    );

    const futureGameBookings = allGameBookingsEnriched.filter(
      (game) => new Date(game.endTime) >= now
    );

    console.log("pastGameBookings", pastGameBookings)

    const allGymBookingsEnriched = await Promise.all(
      allGymBookings.map(async (session) => {
        const enrichedPlayers = await Promise.all(
          session.members.map(async (pid) => {
            const user = await Userlist.findById(pid).select("username");
            const profile = await UserProfile.findOne({ userId: pid });

            const existingRating = profile?.ratings?.find(
              (r) =>
                r.rater.toString() === userId.toString() &&
                r.bookingId.toString() === session._id.toString()
            );

            return {
              _id: pid.toString(),
              username: user ? user.username : "Unknown",
              hasBeenRated: !!existingRating,
              ratedScore: existingRating?.score || 0,
            };
          })
        );

        const formattedDateTime = session.dateTime
          ? format(new Date(session.dateTime), "eee MMM dd, yyyy h:mm a")
          : "Invalid Date";

        return {
          ...session.toObject(),
          players: enrichedPlayers,
          host: session.hostedBy.toString(),
          formattedDateTime,
        };
      })
    );

    const pastGymBookings = allGymBookingsEnriched.filter(
      (s) => new Date(s.dateTime) < now
    );
    const futureGymBookings = allGymBookingsEnriched.filter(
      (s) => new Date(s.dateTime) >= now
    );

    res.render("userProfile/bookings", {
      title: "Your Bookings",
      layout: "main",
      pastGameBookings,
      futureGameBookings,
      pastGymBookings,
      futureGymBookings,
      pastEsportsBookings: [],
      futureEsportsBookings: [],
      currentUserId: userId,
      head: `<link rel="stylesheet" href="/css/bookings.css">`,
    });
  } catch (err) {
    console.error("Bookings route error:", err);
    res.status(500).render("error", { error: err.toString() });
  }
});

// ————— Rate Players API ——————

// router.post("/bookings/rate", verifyToken, async (req, res) => {
//   const raterId = req.user.userID; // Ensure this is a valid ObjectId
//   const { bookingId, ratings } = req.body;

//   try {
//     if (!bookingId || !ratings || !Array.isArray(ratings)) {
//       return res.status(400).json({ error: "Missing bookingId or ratings" });
//     }

//     for (const r of ratings) {
//       const ratedUserId = r.userId;
//       const score = r.score;

//       // Validate ObjectId
//       if (!ObjectId.isValid(ratedUserId)) {
//         console.error(`Invalid rated user ID: ${ratedUserId}`);
//         continue; // Skip invalid entries
//       }

//       // Find the UserProfile of the rated user
//       const profile = await UserProfile.findOne({ userId: ratedUserId });
//       if (!profile) {
//         console.error(`No profile found for user ID: ${ratedUserId}`);
//         continue; // Skip if profile not found
//       }

//       // Add the new rating
//       profile.ratings.push({
//         rater: new ObjectId(raterId), // Ensure rater is an ObjectId
//         score: score,
//         bookingId: new ObjectId(bookingId),
//       });

//       // Update rating count and average rating
//       profile.ratingCount = profile.ratings.length;
//       profile.averageRating =
//         profile.ratings.reduce((sum, rating) => sum + rating.score, 0) /
//         profile.ratingCount;

//       await profile.save();
//     }

//     return res.json({ success: true });
//   } catch (e) {
//     console.error("Error saving ratings:", e);
//     return res
//       .status(500)
//       .json({ error: "An error occurred while saving ratings." });
//   }
// });

router.post("/bookings/rate", verifyToken, async (req, res) => {
  try {
    const raterId = req.user.userID;
    const { bookingId, ratings } = req.body;

    if (!bookingId || !Array.isArray(ratings)) {
      return res.status(400).json({ error: "Missing bookingId or ratings" });
    }

    const result = await userProfileData.ratePlayers(raterId, ratings, bookingId);

    res.json({ success: true, result });
  } catch (err) {
    console.error("Rating failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ————— Show Rate Players Form ——————
router.get("/bookings/rate/:bookingId", verifyToken, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.userID;

  try {
    const booking = await joinGameData.getBookingDetails(bookingId);

    if (!booking) throw "Booking not found";

    const teammates = await Promise.all(
      booking.players
        .filter((pid) => pid.toString() !== userId.toString())
        .map(async (pid) => {
          const user = await Userlist.findById(pid).select("username");
          return {
            userId: pid.toString(),
            username: user?.username || "Unknown",
          };
        })
    );

    res.render("userProfile/ratePlayers", {
      title: "Rate Your Teammates",
      teammates,
      bookingId,
      head: `<link rel="stylesheet" href="/css/ratings.css">`,
    });
  } catch (e) {
    return res.status(404).render("error", { error: e.toString() });
  }
});

// -----------------------------------------
// Follow / Unfollow APIs
// -----------------------------------------
router.get("/view/:targetUserId", verifyToken, async (req, res) => {
  try {
    const profile = await userProfileData.getProfile(req.params.targetUserId);

    const isOwn = req.params.targetUserId === req.user.userID;
    const isFollowing = profile.followers
      .map((f) => f.toString())
      .includes(req.user.userID);
    const enrichedRatings = await Promise.all(
      profile.ratings.map(async (r) => {
        const raterUser = await Userlist.findById(r.rater).select("username");
        return {
          username: raterUser?.username || "Unknown",
          score: r.score,
          review: r.review,
        };
      })
    );



    res.render("userProfile/view", {
      title: `${profile.profile.firstName} ${profile.profile.lastName}`,
      layout: "main",
      firstName: profile.profile.firstName,
      lastName: profile.profile.lastName,
      email: profile.userId.email,
      username: profile.userId.username,
      userId: profile.userId._id,
      bio: profile.profile.bio,
      avatar: profile.profile.avatar || "/images/default-avatar.png",
      sportsInterests: profile.sportsInterests,
      gymPreferences: profile.gymPreferences,
      gamingInterests: profile.gamingInterests,
      location: profile.location,
      karmaPoints: profile.karmaPoints,
      followers: profile.followers,
      following: profile.following,
      averageRating: profile.averageRating,
      ratingCount: profile.ratingCount,
      receivedRatings: enrichedRatings,
      isOwn,
      isFollowing,
      head: `<link rel="stylesheet" href="/css/userProfile.css">`,
    });
  } catch (e) {
    res.status(404).render("error", { error: e.toString() });
  }
});
router.get("/userview/:targetUserId", verifyToken, async (req, res) => {
  try {
    const profile = await userProfileData.getProfile(req.params.targetUserId);

    const isOwn = req.params.targetUserId === req.user.userID;
    const isFollowing = profile.followers
      .map((f) => f.toString())
      .includes(req.user.userID);

    const enrichedRatings = await Promise.all(
      profile.ratings.map(async (r) => {
        const raterUser = await Userlist.findById(r.rater).select("username");
        return {
          username: raterUser?.username || "Unknown",
          score: r.score,
          review: r.review,
        };
      })
    );


    res.render("userProfile/userview", {
      title: `${profile.profile.firstName} ${profile.profile.lastName}`,
      layout: "main",
      viewedUser: {
        firstName: profile.profile.firstName,
        lastName: profile.profile.lastName,
        email: profile.userId.email,
        username: profile.userId.username,
        userId: profile.userId._id,
        bio: profile.profile.bio,
        avatar: profile.profile.avatar || "/images/default-avatar.png",
        sportsInterests: profile.sportsInterests,
        gymPreferences: profile.gymPreferences,
        gamingInterests: profile.gamingInterests,
        location: profile.location,
        karmaPoints: profile.karmaPoints,
        followers: profile.followers,
        following: profile.following,
        averageRating: profile.averageRating,
        ratingCount: profile.ratingCount,
        receivedRatings: enrichedRatings,
        isOwn,
        isFollowing,
      },
      head: `<link rel="stylesheet" href="/css/userProfile.css">`,
    });
  } catch (e) {
    res.status(404).render("error", { error: e.toString() });
  }
});

router.post("/follow/:targetUserId", verifyToken, async (req, res) => {
  try {
    const count = await userProfileData.followUser(
      req.user.userID,
      req.params.targetUserId
    );
    return res.json({ followersCount: count });
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});

router.post("/unfollow/:targetUserId", verifyToken, async (req, res) => {
  try {
    const count = await userProfileData.unfollowUser(
      req.user.userID,
      req.params.targetUserId
    );
    return res.json({ followersCount: count });
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});

export default router;
