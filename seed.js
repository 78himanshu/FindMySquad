import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/mongoConnections.js";
import User from "./models/User.js";
import UserProfile from "./models/userProfile.js";
import Game from "./models/hostGame.js";
import Gym from "./models/Gym.js";

const seed = async () => {
  await connectDB();

  try {
    // Creating new Users
    const user1 = new User({
      username: "playerOne",
      email: "player1@example.com",
      password: "User@123",
      profileCompleted: true,
    });
    const user2 = new User({
      username: "hostUser",
      email: "host@example.com",
      password: "User@123",
      profileCompleted: true,
    });
    const user3 = new User({
      username: "sarah99",
      email: "sarah@example.com",
      password: "User@123",
      profileCompleted: true,
    });
    const user4 = new User({
      username: "johnnyBall",
      email: "johnny@example.com",
      password: "User@123",
      profileCompleted: true,
    });
    const user5 = new User({
      username: "fitguru",
      email: "guru@example.com",
      password: "User@123",
      profileCompleted: true,
    });

    await user1.save();
    await user2.save();
    await user3.save();
    await user4.save();
    await user5.save();

    // Create User Profiles
    await UserProfile.insertMany([
      {
        userId: user1._id,
        profile: {
          firstName: "Player",
          lastName: "One",
          bio: "Loves sports",
          gender: "Male",
        },
        city: "New York",
        phoneNumber: "1234567890",
        geoLocation: {
          type: "Point",
          coordinates: [-73.9857, 40.7484],
        },
      },
      {
        userId: user2._id,
        profile: {
          firstName: "Host",
          lastName: "User",
          bio: "Organizer",
          gender: "Female",
        },
        city: "Jersey City",
        phoneNumber: "9876543210",
        geoLocation: {
          type: "Point",
          coordinates: [-74.0672, 40.7282],
        },
      },
    ]);

    await UserProfile.insertMany([
      {
        userId: user3._id,
        profile: { firstName: "Sarah", lastName: "Lee", gender: "Female" },
        city: "Brooklyn",
        phoneNumber: "5551112233",
        geoLocation: { type: "Point", coordinates: [-73.9442, 40.6782] },
      },
      {
        userId: user4._id,
        profile: { firstName: "Johnny", lastName: "Ball", gender: "Male" },
        city: "Queens",
        phoneNumber: "5552223344",
        geoLocation: { type: "Point", coordinates: [-73.7949, 40.7282] },
      },
      {
        userId: user5._id,
        profile: { firstName: "Fit", lastName: "Guru", gender: "Male" },
        city: "Bronx",
        phoneNumber: "5553334455",
        geoLocation: { type: "Point", coordinates: [-73.8648, 40.8448] },
      },
    ]);

    // Create a Game
    await Game.create({
      title: "Pickup Soccer Match",
      sport: "Soccer",
      playersRequired: 10,
      playersGoing: 1,
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // +1 day
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 26), // +3 hrs
      description: "Friendly match at the park",
      costPerHead: 5,
      skillLevel: "Beginner",
      host: user2._id,
      location: "Central Park, NYC",
      players: [user2._id],
      geoLocation: {
        type: "Point",
        coordinates: [-73.9654, 40.7829],
      },
    });

    // Create a Gym Session
    await Gym.create({
      title: "Evening Workout",
      gym: "Anytime Fitness",
      description: "Full body HIIT session",
      date: new Date(Date.now() + 1000 * 60 * 60 * 48)
        .toISOString()
        .split("T")[0],
      startTime: "18:00",
      endTime: "19:30",
      gymlocation: "456 Muscle Blvd, Jersey City",
      experience: "1+ year",
      workoutType: "Body Building",
      hostedBy: user1._id,
      players: [user1._id],
      currentMembers: 1,
      maxMembers: 2,
      geoLocation: {
        type: "Point",
        coordinates: [-74.0672, 40.7282],
      },
    });

    await Game.insertMany([
      {
        title: "Community Game 1",
        sport: "Basketball",
        playersRequired: 7,
        playersGoing: 1,
        startTime: new Date("2025-05-16T01:12:00Z"),
        endTime: new Date("2025-05-16T03:12:00Z"),
        description: "Casual match - Game 1",
        costPerHead: 5,
        skillLevel: "Intermediate",
        host: user3._id,
        location: "Local Park 1",
        players: [user3._id],
        geoLocation: { type: "Point", coordinates: [-73.9, 40.75] },
      },
      {
        title: "Community Game 2",
        sport: "Basketball",
        playersRequired: 5,
        playersGoing: 1,
        startTime: new Date("2025-05-17T01:12:00Z"),
        endTime: new Date("2025-05-17T03:12:00Z"),
        description: "Casual match - Game 2",
        costPerHead: 0,
        skillLevel: "Intermediate",
        host: user4._id,
        location: "Local Park 2",
        players: [user4._id],
        geoLocation: { type: "Point", coordinates: [-73.89, 40.76] },
      },
      {
        title: "Community Game 3",
        sport: "Badminton",
        playersRequired: 6,
        playersGoing: 1,
        startTime: new Date("2025-05-18T01:12:00Z"),
        endTime: new Date("2025-05-18T03:12:00Z"),
        description: "Casual match - Game 3",
        costPerHead: 10,
        skillLevel: "Beginner",
        host: user5._id,
        location: "Local Park 3",
        players: [user5._id],
        geoLocation: { type: "Point", coordinates: [-73.88, 40.77] },
      },
    ]);

    await Gym.insertMany([
      {
        title: "Morning Burn 1",
        gym: "FitZone 1",
        description: "HIIT and strength mix",
        date: "2025-05-17",
        startTime: "07:00",
        endTime: "08:00",
        gymlocation: "Gym Street 10",
        experience: "3+ year",
        workoutType: "Cardio",
        hostedBy: user3._id,
        players: [user3._id],
        currentMembers: 1,
        maxMembers: 4,
        geoLocation: { type: "Point", coordinates: [-74.0, 40.72] },
      },
      {
        title: "Morning Burn 2",
        gym: "FitZone 2",
        description: "HIIT and strength mix",
        date: "2025-05-18",
        startTime: "07:00",
        endTime: "08:00",
        gymlocation: "Gym Street 11",
        experience: "3+ year",
        workoutType: "Cardio",
        hostedBy: user4._id,
        players: [user4._id],
        currentMembers: 1,
        maxMembers: 4,
        geoLocation: { type: "Point", coordinates: [-73.99, 40.73] },
      },
      {
        title: "Morning Burn 3",
        gym: "FitZone 3",
        description: "HIIT and strength mix",
        date: "2025-05-19",
        startTime: "07:00",
        endTime: "08:00",
        gymlocation: "Gym Street 12",
        experience: "3+ year",
        workoutType: "Cardio",
        hostedBy: user5._id,
        players: [user5._id],
        currentMembers: 1,
        maxMembers: 4,
        geoLocation: { type: "Point", coordinates: [-73.98, 40.74] },
      },
    ]);

    console.log("Seed data inserted successfully.");
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();
