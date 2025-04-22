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
//       const profile = await userProfileData.getProfile(req.user.userID);
//       res.status(200).json(profile);
//     } catch (e) {
//       res.status(404).json({ error: e.toString() });
//     }
//   })
//   .post(verifyToken, async (req, res) => {
//     try {
//       // Use req.user.userID here because the auth middleware sets it
//       const profile = await userProfileData.createProfile(req.user.userID, req.body);
//       res.status(201).json(profile);
//     } catch (e) {
//       res.status(400).json({ error: e.toString() });
//     }
//   })
//   .put(verifyToken, async (req, res) => {
//     try {
//       const updated = await userProfileData.updateProfile(req.user.userID, req.body);
//       res.status(200).json(updated);
//     } catch (e) {
//       res.status(400).json({ error: e.toString() });
//     }
//   })
//   .delete(verifyToken, async (req, res) => {
//     try {
//       await userProfileData.deleteProfile(req.user.userID);
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
//       const profile = await userProfileData.getProfile(req.user.userID);
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

import express from "express";
import { Router } from "express";
import { userProfileData } from "../data/index.js";
import verifyToken from "../middleware/auth.js";
import { checkString } from "../utils/helper.js";

const router = Router();

// -----------------------------------------
// API Routes - For frontend AJAX / Postman use
// -----------------------------------------
router
  .route("/")
  .get(verifyToken, async (req, res) => {
    try {
      const profile = await userProfileData.getProfile(req.user.userID);
      res.status(200).json(profile);
    } catch (e) {
      res.status(404).json({ error: e.toString() });
    }
  })
  .post(verifyToken, async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        bio,
        gender,
        profilePic,
        sportsInterests,
        gymPreferences,
        gamingInterests,
        location,
      } = req.body;

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
      const updated = await userProfileData.updateProfile(
        req.user.userID,
        req.body
      );
      res.status(200).json(updated);
    } catch (e) {
      res.status(400).json({ error: e.toString() });
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
    console.log("profile", profile);
    res.render("userProfile/view", {
      title: "Your Profile",
      layout: "main",
      firstName: profile.profile.firstName,
      lastName: profile.profile.lastName,
      email: profile.userId.email,
      userId: profile.userId._id,
      bio: profile.profile.bio,
      sportsInterests: profile.sportsInterests,
      username: profile.userId.username,
      karmaPoints: profile.karmaPoints,
      gymPreferences: profile.gymPreferences,
      gamingInterests: profile.gamingInterests,
      Followers: profile.Followers,
      Following: profile.Following,
      avatar: profile.profile.avatar || "/images/default-avatar.png",
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
        city: profile.profile.city,
        state: profile.profile.state,
        zipCode: profile.profile.zipCode,
        head: `<link rel="stylesheet" href="/css/editProfile.css">`,
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
    // firstName: user.firstName || '',
    // lastName: user.lastName || '',
    // gender: user.gender || '',
    // bio: user.bio || '',
    // selectedPic: user.profilePic || '',
    // selectedSports: user.sportsInterests || [],
  });
});

export default router;

// // ==========================================
// // 1. FIX FOR PROFILE CREATION ENDPOINT
// // ==========================================

// // In routes/userProfileRoutes.js - Fix the profile creation route
// // Replace the route('/') POST handler with:

// // Fix the profile creation endpoint - the issue is in your API endpoint path
// // Your form submits to '/profile' but your route is at '/api/profile'
// router
//   .route('/')
//   .post(verifyToken, async (req, res) => {
//     try {
//       const { firstName, lastName, bio, gender, profilePic, sportsInterests, gymPreferences, gamingInterests } = req.body;

//       console.log("Profile data received:", req.body);

//       // Validation
//       if (!firstName || !lastName || !gender || !profilePic || !sportsInterests || !gymPreferences || !gamingInterests) {
//         return res.status(400).json({ error: "All fields are required" });
//       }

//       checkString(firstName, "firstName");
//       checkString(lastName, "lastName");
//       checkString(gender, "gender");
//       checkString(profilePic, "profilePic");

//       // Validate arrays if they exist
//       if (Array.isArray(sportsInterests)) {
//         sportsInterests.forEach((interest) => checkString(interest, "sportsInterests"));
//       }

//       if (Array.isArray(gymPreferences)) {
//         gymPreferences.forEach((preference) => checkString(preference, "gymPreferences"));
//       }

//       if (Array.isArray(gamingInterests)) {
//         gamingInterests.forEach((interest) => checkString(interest, "gamingInterests"));
//       }

//       // Create profile data object
//       let profileData = {
//         profile: {
//           firstName,
//           lastName,
//           gender,
//           bio,
//           avatar: profilePic,
//         },
//         sportsInterests,
//         gymPreferences,
//         gamingInterests
//       };

//       // Create the profile
//       const profile = await userProfileData.createProfile(req.user.userID, profileData);
//       res.status(201).json(profile);
//     } catch (e) {
//       console.error("Profile creation error:", e);
//       res.status(400).json({ error: e.toString() });
//     }
//   });

// // ==========================================
// // 2. CLIENT-SIDE VALIDATION IN userProfile.js
// // ==========================================

// // Replace contents of public/js/userProfile.js with:

// document.addEventListener('DOMContentLoaded', () => {
//   console.log("User Profile JS Loaded");

//   // Setup form validation if we're on the edit profile page
//   const editForm = document.getElementById('editProfileForm');
//   if (editForm) {
//     setupEditFormValidation(editForm);
//   }

//   // Setup form validation if we're on the complete profile page
//   const completeForm = document.getElementById('profileForm');
//   if (completeForm) {
//     setupCompleteProfileValidation(completeForm);
//   }
// });

// function setupEditFormValidation(form) {
//   form.addEventListener('submit', function(e) {
//     // Reset error messages
//     const errorElements = document.querySelectorAll('.error-message');
//     errorElements.forEach(el => el.textContent = '');

//     let isValid = true;

//     // Validate first name
//     const firstName = form.firstName.value.trim();
//     if (!firstName) {
//       displayError('firstName', 'First name is required');
//       isValid = false;
//     } else if (firstName.length < 2) {
//       displayError('firstName', 'First name must be at least 2 characters');
//       isValid = false;
//     }

//     // Validate last name
//     const lastName = form.lastName.value.trim();
//     if (!lastName) {
//       displayError('lastName', 'Last name is required');
//       isValid = false;
//     } else if (lastName.length < 2) {
//       displayError('lastName', 'Last name must be at least 2 characters');
//       isValid = false;
//     }

//     // Validate bio (optional but if provided, should be reasonable)
//     const bio = form.bio.value.trim();
//     if (bio && bio.length > 500) {
//       displayError('bio', 'Bio must be less than 500 characters');
//       isValid = false;
//     }

//     // Validate zip code if provided
//     const zipCode = form.zipCode?.value?.trim();
//     if (zipCode && !/^\d{5}(-\d{4})?$/.test(zipCode)) {
//       displayError('zipCode', 'Please enter a valid zip code');
//       isValid = false;
//     }

//     // If the form is not valid, prevent submission
//     if (!isValid) {
//       e.preventDefault();
//       showToast('Please fix the errors in the form.');
//     }
//   });
// }

// function setupCompleteProfileValidation(form) {
//   form.addEventListener('submit', async function(e) {
//     e.preventDefault();

//     // Clear any previous error
//     const existingError = document.getElementById('formError');
//     if (existingError) existingError.remove();

//     // Reset validation states
//     let isValid = true;

//     // Validate required fields
//     const firstName = form.firstName.value.trim();
//     const lastName = form.lastName.value.trim();
//     const gender = form.gender.value;
//     const profilePic = form.querySelector('input[name="profilePic"]:checked');
//     const sports = Array.from(form.querySelectorAll('input[name="sportsInterests"]:checked')).map(i => i.value);
//     const workouts = Array.from(form.querySelectorAll('input[name="workoutTypes"]:checked')).map(i => i.value);
//     const games = Array.from(form.querySelectorAll('input[name="gamingOptions"]:checked')).map(i => i.value);
//     const bio = form.bio.value.trim();

//     // Validate each field
//     if (!firstName) {
//       showToast('First name is required.');
//       isValid = false;
//     }

//     if (!lastName) {
//       showToast('Last name is required.');
//       isValid = false;
//     }

//     if (!gender) {
//       showToast('Please select a gender.');
//       isValid = false;
//     }

//     if (!profilePic) {
//       showToast('Please select a profile picture.');
//       isValid = false;
//     }

//     if (sports.length === 0) {
//       showToast('Please select at least one sport.');
//       isValid = false;
//     }

//     if (workouts.length === 0) {
//       showToast('Please select at least one workout type.');
//       isValid = false;
//     }

//     if (games.length === 0) {
//       showToast('Please select at least one gaming interest.');
//       isValid = false;
//     }

//     // If all validations pass, submit the form
//     if (isValid) {
//       // Prepare and send the data
//       const profileData = {
//         firstName,
//         lastName,
//         gender,
//         profilePic: profilePic.value,
//         bio,
//         sportsInterests: sports,
//         gymPreferences: workouts,
//         gamingInterests: games
//       };

//       try {
//         // IMPORTANT FIX: Change endpoint from '/profile' to '/api/profile'
//         const res = await fetch('/api/profile', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(profileData)
//         });

//         const result = await res.json();
//         if (res.ok) {
//           showToast('Profile saved successfully!', true);
//           setTimeout(() => window.location.href = '/', 1500);
//         } else {
//           showToast(result.error || 'Something went wrong.', false);
//         }
//       } catch (err) {
//         console.error(err);
//         showToast('Server error occurred.', false);
//       }
//     }
//   });
// }

// // Display error message under a specific field
// function displayError(fieldId, message) {
//   const field = document.getElementById(fieldId);
//   if (!field) return;

//   // Create error message element if it doesn't exist
//   let errorElement = field.parentNode.querySelector('.error-message');
//   if (!errorElement) {
//     errorElement = document.createElement('div');
//     errorElement.className = 'error-message text-danger small mt-1';
//     field.parentNode.appendChild(errorElement);
//   }

//   errorElement.textContent = message;
// }

// // Toast utility function (assuming Bootstrap's toast is available)
// function showToast(message, isSuccess = false) {
//   const toast = document.getElementById('toastMsg');
//   if (!toast) return;

//   const toastBody = document.getElementById('toastBody');

//   // Set message and color
//   toastBody.textContent = message;
//   toast.classList.remove('bg-danger', 'bg-success');
//   toast.classList.add(isSuccess ? 'bg-success' : 'bg-danger');

//   // Show toast
//   const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
//   toastBootstrap.show();
// }

// // ==========================================
// // 3. IMPLEMENT DATA VALIDATION IN data/userProfile.js
// // ==========================================

// // Add this function to data/userProfile.js after the imports:

// const validateProfileData = (data) => {
//   // Validate profile data
//   const { profile } = data;

//   if (!profile) {
//     throw new Error("Profile information is required");
//   }

//   if (profile.firstName) {
//     checkString(profile.firstName, "First Name");
//   }

//   if (profile.lastName) {
//     checkString(profile.lastName, "Last Name");
//   }

//   if (profile.bio && typeof profile.bio !== 'string') {
//     throw new Error("Bio must be a string");
//   }

//   if (profile.gender && !['Male', 'Female', 'Other'].includes(profile.gender)) {
//     throw new Error("Gender must be Male, Female, or Other");
//   }

//   // Validate arrays if they exist
//   if (data.sportsInterests && !Array.isArray(data.sportsInterests)) {
//     throw new Error("Sports interests must be an array");
//   }

//   if (data.gymPreferences && !Array.isArray(data.gymPreferences)) {
//     throw new Error("Gym preferences must be an array");
//   }

//   if (data.gamingInterests && !Array.isArray(data.gamingInterests)) {
//     throw new Error("Gaming interests must be an array");
//   }

//   // Validate location if it exists
//   if (data.location) {
//     const { location } = data;

//     if (location.city && typeof location.city !== 'string') {
//       throw new Error("City must be a string");
//     }

//     if (location.state && typeof location.state !== 'string') {
//       throw new Error("State must be a string");
//     }

//     if (location.zipCode && typeof location.zipCode !== 'string') {
//       throw new Error("Zip code must be a string");
//     }

//     if (location.latitude && isNaN(Number(location.latitude))) {
//       throw new Error("Latitude must be a number");
//     }

//     if (location.longitude && isNaN(Number(location.longitude))) {
//       throw new Error("Longitude must be a number");
//     }
//   }

//   return true;
// };

// // Then modify the createProfile function to use this validation:

// export const createProfile = async (userId, data) => {
//   const existing = await UserProfile.findOne({ userId });
//   if (existing) throw 'Profile already exists';

//   // Validate profile data
//   validateProfileData(data);

//   const newProfile = new UserProfile({ userId, ...data });
//   await newProfile.save();

//   if (newProfile) {
//     // Update profileCompleted in userList
//     await Userlist.updateOne({ _id: userId }, { $set: { profileCompleted: true } });
//   }
//   return newProfile;
// };

// // Modify the updateProfile function as well:

// export const updateProfile = async (userId, data) => {
//   // Validate data if it's not empty
//   if (Object.keys(data).length > 0) {
//     validateProfileData(data);
//   }

//   const updated = await UserProfile.findOneAndUpdate(
//     { userId },
//     { $set: data },
//     { new: true }
//   );

//   if (!updated) throw 'Profile not found';
//   return updated;
// };
