// import express from 'express';
// import { Router } from 'express';
// import { userProfileData } from '../data/index.js';
// import verifyToken from '../middleware/auth.js';

// const router = Router();

// // API Routes - For frontend AJAX or Postman use

// router
//   .route('/')
//   .get(verifyToken, async (req, res) => {
//     try {
//       const profile = await userProfileData.getProfile(req.userId);
//       res.status(200).json(profile);
//     } catch (e) {
//       res.status(404).json({ error: e.toString() });
//     }
//   })
//   .post(verifyToken, async (req, res) => {
//     try {
//       // Use req.userId here because the auth middleware sets it
//       const profile = await userProfileData.createProfile(req.userId, req.body);
//       res.status(201).json(profile);
//     } catch (e) {
//       res.status(400).json({ error: e.toString() });
//     }
//   })
//   .put(verifyToken, async (req, res) => {
//     try {
//       const updated = await userProfileData.updateProfile(req.userId, req.body);
//       res.status(200).json(updated);
//     } catch (e) {
//       res.status(400).json({ error: e.toString() });
//     }
//   })
//   .delete(verifyToken, async (req, res) => {
//     try {
//       await userProfileData.deleteProfile(req.userId);
//       res.status(200).json({ message: 'Profile deleted successfully' });
//     } catch (e) {
//       res.status(400).json({ error: e.toString() });
//     }
//   });

// // View Route - To Render UserProfile Frontend Page

// router
//   .route('/view')
//   .get(verifyToken, async (req, res) => {
//     try {
//       const profile = await userProfileData.getProfile(req.userId);
//       res.render('userProfile/view', {
//         title: "Your Profile",
//         firstName: profile.profile.firstName,
//         lastName: profile.profile.lastName,
//         email: profile.profile.email,
//         userId: profile.userId,
//         avatar: profile.profile.avatar || "/images/default-avatar.png",
//         head: `
//           <link rel="stylesheet" href="/css/userProfile.css">
//         `
//       });
//     } catch (e) {
//       res.status(404).render('error', { error: e.toString() });  // <-- this is correct now
//     }
//   });

// export default router;


import express from 'express';
import { Router } from 'express';
import { userProfileData } from '../data/index.js';
import verifyToken from '../middleware/auth.js';
import { checkString } from "../utils/helper.js";


const router = Router();

// -----------------------------------------
// API Routes - For frontend AJAX / Postman use
// -----------------------------------------
router
  .route('/')
  .get(verifyToken, async (req, res) => {
    try {
      const profile = await userProfileData.getProfile(req.userId);
      res.status(200).json(profile);
    } catch (e) {
      res.status(404).json({ error: e.toString() });
    }
  })
  .post(verifyToken, async (req, res) => {
    try {
      const { firstName, lastName, gender, profilePic, sportsInterests, gymPreferences, gamingInterests } = req.body;

      console.log(">>>", req.body);

      if (!firstName || !lastName || !gender || !profilePic || !sportsInterests || !gymPreferences || !gamingInterests) {
        return res.status(400).json({ error: "All fields are requiredddd" });
      }

      checkString(firstName, "firstName");
      checkString(lastName, "lastName");
      checkString(gender, "gender");
      sportsInterests.forEach((interest) => checkString(interest, "sportsInterests"));
      gymPreferences.forEach((preference) => checkString(preference, "gymPreferences"));
      gamingInterests.forEach((interest) => checkString(interest, "gamingInterests"));

      let profileData = {
        firstName,
        lastName,
        gender,
        sportsInterests,
        gymPreferences,
        gamingInterests
      }

      const profile = await userProfileData.createProfile(req.userId, profileData);

      res.status(201).json(profile);
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  })
  .put(verifyToken, async (req, res) => {
    try {
      const updated = await userProfileData.updateProfile(req.userId, req.body);
      res.status(200).json(updated);
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  })
  .delete(verifyToken, async (req, res) => {
    try {
      await userProfileData.deleteProfile(req.userId);
      res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  });

// -----------------------------------------
// View Route - Render UserProfile Frontend Page
// -----------------------------------------
router
  .route('/view')
  .get(verifyToken, async (req, res) => {
    try {
      const profile = await userProfileData.getProfile(req.userId);
      res.render('userProfile/view', {
        title: "Your Profile",
        firstName: profile.profile.firstName,
        lastName: profile.profile.lastName,
        email: profile.profile.email,
        userId: profile.userId,
        avatar: profile.profile.avatar || "/images/default-avatar.png",
        head: `<link rel="stylesheet" href="/css/userProfile.css">`
      });
    } catch (e) {
      res.status(404).render('error', { error: e.toString() });
    }
  });

// -----------------------------------------
// Edit Profile Routes - Render Edit Form & Process Updates
// -----------------------------------------
router
  .route('/edit')
  .get(verifyToken, async (req, res) => {
    try {
      const profile = await userProfileData.getProfile(req.userId);
      res.render('userProfile/edit', {
        title: "Edit Profile",
        firstName: profile.profile.firstName,
        lastName: profile.profile.lastName,
        bio: profile.profile.bio,
        avatar: profile.profile.avatar,
        city: profile.profile.city,
        state: profile.profile.state,
        zipCode: profile.profile.zipCode,
        head: `<link rel="stylesheet" href="/css/editProfile.css">`
      });
    } catch (e) {
      res.status(404).render('error', { error: e.toString() });
    }
  })
  .post(verifyToken, async (req, res) => {
    try {
      const updated = await userProfileData.updateProfile(req.userId, req.body);
      res.redirect('/api/profile/view?success=Profile updated successfully');
    } catch (e) {
      res.status(400).render('error', { error: e.toString() });
    }
  });

router
  .route("/addprofile")
  .get((req, res) => {
    // console.log("req", req)
    res.render("userProfile/complete-profile", {
      title: "Complete Profile",
      layout: "main",
      error: req.query.error,
      username: req.username || null || "",
      email: req.query.email || "",
      head: `
        <link rel="stylesheet" href="/css/signup.css">
        <link rel="stylesheet" href="/css/modal.css">
        <link rel="stylesheet" href="/css/styles.css">
      `,
      layout: "main",
      sportsList: ['Soccer', 'Basketball', 'Baseball', 'Tennis', 'Swimming', 'Running', 'Cycling', 'Hiking', 'Golf', 'Volleyball'],
      workoutTypes: [
        'Cardio',
        'Weight Training',
        'CrossFit',
        'Yoga',
        'HIIT',
        'Pilates',
        'Zumba',
        'Bodyweight'
      ],
      gamingOptions: [
        'FPS (e.g., Call of Duty)',
        'Battle Royale (e.g., Fortnite)',
        'MOBA (e.g., Dota 2)',
        'Sports (e.g., FIFA)',
        'Racing (e.g., Forza)',
        'Simulation (e.g., Sims)',
        'RPG (e.g., Elden Ring)',
        'MMORPG',
        'Strategy',
        'Puzzle'
      ],
      // firstName: user.firstName || '',
      // lastName: user.lastName || '',
      // gender: user.gender || '',
      // bio: user.bio || '',
      // selectedPic: user.profilePic || '',
      // selectedSports: user.sportsInterests || [],


    });
  })

export default router;
