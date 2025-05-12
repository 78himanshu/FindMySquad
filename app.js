let serverBootTime = Date.now();

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import sanitizeRequest from "./utils/sanitize.js";
import { fileURLToPath } from "url";
import connectDB from "./config/mongoConnections.js";
import { scheduleAllPendingReminders } from "./emailScheduler.js";

// Wait for DB connection and schedule reminders BEFORE app setup
await connectDB();
await scheduleAllPendingReminders();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import gymBuddyRoutes from "./routes/gymBuddyRoutes.js";
import hostGameRoutes from "./routes/hostGamesRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import methodOverride from "method-override";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import Handlebars from "handlebars";
import configRoutesFunction from "./routes/index.js";
import "./utils/handlebarsHelper.js";
import esportsRoutes from "./routes/esports.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";
import http from "http";
import { Server } from "socket.io";
import Game from "./models/hostGame.js";
import ChatMessage from "./models/ChatMessage.js";
import { attachProfileStatus } from "./middleware/profileStatus.js";

const app = express();

const hbs = exphbs.create({
  defaultLayout: false,
  extname: ".handlebars",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    eq: (a, b) => a === b,
    lt: (a, b) => a < b,
    add: (a, b) => a + b,
    gt: (a, b) => a > b,
    gte: (a, b) => a >= b,
    lte: (a, b) => a <= b,
    length: (array) => (Array.isArray(array) ? array.length : 0),
    includes: (arr, val) => Array.isArray(arr) && arr.includes(val.toString()),
    json: (context) => JSON.stringify(context, null, 2),
    encodeURI: (str) => encodeURIComponent(str),

    array: (...args) => {
      return args.slice(0, -1);
    },

    playersCount: (format) => {
      if (typeof format !== "string") return "";
      const parts = format.split("v");
      return parts.length > 0 && !isNaN(parts[0]) ? parts[0] : "";
    },

    formatBadgeName: function (badge) {
      if (!badge) return "";
      return badge
        .replace(/([a-z])([A-Z])/g, "$1 $2") // split camelCase
        .replace(/_/g, " ") // replace underscores
        .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize first letter
    },

    badgeImageName: function (badge) {
      if (!badge) return "default.png";
      const map = {
        "Pro Host": "prohost.png",
        Host: "host.png",
        Rookie: "rookie.png",
        Advanced: "advanced.png",
        Leader: "leader.png",
      };
      return map[badge] || "default.png";
    },

    formatDate: (datetime) => {
      if (!datetime) return "";
      return new Date(datetime).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    formatTime: (timeVal) => {
      if (!timeVal) return "";

      let hour, minute;

      if (typeof timeVal === "string" && timeVal.includes(":")) {
        [hour, minute] = timeVal.split(":");
        hour = parseInt(hour, 10);
        minute = parseInt(minute, 10);
      } else if (timeVal instanceof Date || !isNaN(Date.parse(timeVal))) {
        const dateObj = new Date(timeVal);
        hour = dateObj.getHours();
        minute = dateObj.getMinutes();
      } else {
        return "";
      }

      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
    },

    formatDateInput: (datetime) => {
      if (!datetime) return "";
      const date = new Date(datetime);
      return date.toISOString().split("T")[0];
    },

    formatTimeInput: (datetime) => {
      if (!datetime) return "";
      const date = new Date(datetime);
      return date.toTimeString().slice(0, 5); // "HH:mm"
    },

    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
        case "!=":
          return v1 != v2 ? options.fn(this) : options.inverse(this);
        case "==":
          return v1 == v2 ? options.fn(this) : options.inverse(this);
        case ">":
          return v1 > v2 ? options.fn(this) : options.inverse(this);
        case "<":
          return v1 < v2 ? options.fn(this) : options.inverse(this);
        case ">=":
          return v1 >= v2 ? options.fn(this) : options.inverse(this);
        case "<=":
          return v1 <= v2 ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    },

    range: (from, to) => {
      let result = [];
      for (let i = from; i <= to; i++) {
        result.push(i);
      }
      return result;
    },

    object: (...args) => {
      const options = args.pop();
      return args.reduce((acc, val, i) => {
        if (i % 2 === 0) acc[val] = args[i + 1];
        return acc;
      }, {});
    },
    subtract: (a, b) => a - b,
  },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize *all* incoming data (body, query, params)
app.use(sanitizeRequest);

// for statis files
app.use(express.static(path.join(__dirname, "public")));

// always Add this middleware BEFORE your routes
app.use(cookieParser());

app.use((req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded.userId) {
        console.log("❌ JWT token missing userId:", decoded);
        res.clearCookie("token");
        res.locals.isLoggedIn = false;
        return res.status(401).send("Unauthorized: User info missing");
      }

      // Invalidate token if it's older than server boot time
      if (decoded.iat * 1000 < serverBootTime) {
        res.clearCookie("token");
        res.locals.isLoggedIn = false;
        res.locals.username = null;
        res.locals.profilePic = "/images/default-avatar.png"; // fallback
        return next();
      }

      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        profilePic: decoded.profilePic || "/images/default-avatar.png",
        profileCompleted: decoded.profileCompleted || false,
      };

      res.locals.isLoggedIn = true;
      res.locals.username = decoded.username;
      res.locals.profilePic =
        decoded.profilePic || "/images/default-avatar.png";
      res.locals.userId = decoded.userId;
      res.locals.profileCompleted = decoded.profileCompleted || false;
    } catch (err) {
      res.locals.isLoggedIn = false;
      res.locals.username = null;
      res.locals.profilePic = "/images/default-avatar.png"; // fallback
      res.clearCookie("token");
    }
  } else {
    res.locals.isLoggedIn = false;
    res.locals.username = null;
    res.locals.profilePic = "/images/default-avatar.png"; // fallback
  }

  next();
});

app.use((req, res, next) => {
  // pick up any ?success= or ?error= query params
  res.locals.success = req.query.success || "";
  res.locals.error = req.query.error || "";
  // tournament toasts
  res.locals.justCreated = req.query.tournamentCreated === "1";
  res.locals.justDeleted = req.query.tournamentDeleted === "1";
  // footer year
  res.locals.currentYear = new Date().getFullYear();
  next();
});

app.use(attachProfileStatus);

// Routes
configRoutesFunction(app);
app.use("/host", hostGameRoutes);
app.use("/gymBuddy", gymBuddyRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/esports", esportsRoutes);
app.use("/join", esportsRoutes);
app.use("/profile", userProfileRoutes);
// 404 Handler (must come after routes but before error handler)
app.use((req, res, next) => {
  console.log("404 Handler triggered for:", req.originalUrl);
  res.status(404).render("error", {
    title: "404 Not Found",
    error: "The page you requested could not be found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.stack);
  res.status(500).render("error", {
    title: "Error",
    error:
      process.env.NODE_ENV === "development"
        ? err.stack
        : "Something went wrong",
  });
});

// for chat-message for joined game
// Create HTTP server and bind it to Express app
const server = http.createServer(app);

// Initialize Socket.IO server with open CORS policy
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as needed for production
  },
});

// Attach Socket.IO instance to app for external use
app.set("io", io);

// Store active chat sessions by game ID
const activeChats = {};

// Handle socket connections
io.on("connection", (socket) => {
  console.log("User connected to Socket.IO:", socket.id);

  // User attempts to join a chat room for a specific game
  socket.on("joinGameChat", async ({ gameId, userId }) => {
    try {
      const game = await Game.findById(gameId);
      if (!game) {
        socket.emit("chatClosed", "Game not found.");
        return;
      }

      const now = Date.now();
      const end = new Date(game.endTime).getTime();

      // If the current time is past the game's end, disallow chat
      if (now > end) {
        socket.emit("chatClosed", "This chat has ended.");
        return;
      }

      // Join the room for this game
      socket.join(gameId);
      console.log(`User ${userId} joined chat room for game ${gameId}`);

      // Load chat history and send to the newly joined client
      const pastMessages = await ChatMessage.find({ gameId })
        .sort({ timestamp: 1 })
        .lean();

      socket.emit("previousMessages", pastMessages);

      // Track and timeout the room if it's not already active
      if (!activeChats[gameId]) {
        activeChats[gameId] = {
          sockets: new Set(),
          endTime: end,
        };

        const msRemaining = end - now;
        setTimeout(() => {
          io.to(gameId).emit("chatClosed", "This chat has ended.");
          io.socketsLeave(gameId);
          delete activeChats[gameId];
          console.log(`Chat room ${gameId} closed due to timeout`);
        }, msRemaining);
      }

      activeChats[gameId].sockets.add(socket.id);
    } catch (err) {
      console.error("Error handling joinGameChat:", err);
      socket.emit("chatClosed", "An error occurred while joining the chat.");
    }
  });

  // Handle new messages sent by users
  socket.on("sendMessage", async ({ gameId, username, message }) => {
    const now = Date.now();
    const chatEnd = activeChats[gameId]?.endTime;

    const messageData = {
      username,
      message,
      time: new Date(now).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (chatEnd && now < chatEnd) {
      io.to(gameId).emit("receiveMessage", messageData);
      console.log(`Message from ${username} in ${gameId}: ${message}`);

      // Store in DB
      try {
        await ChatMessage.create({
          gameId,
          username,
          message,
          timestamp: new Date(now),
        });
      } catch (err) {
        console.error("Failed to save message:", err);
      }
    } else {
      socket.emit("chatClosed", "This chat has ended.");
    }
  });
});
app.use(methodOverride("_method"));

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
