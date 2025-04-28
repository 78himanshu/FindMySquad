let serverBootTime = Date.now();
import dotenv from "dotenv";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/mongoConnections.js";
import exphbs from "express-handlebars";
import fs from "fs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import gymBuddyRoutes from "./routes/gymBuddyRoutes.js";
import hostGameRoutes from "./routes/hostGamesRoutes.js";

// Handlebars prototype access (to fix _id issues in Handlebars)
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import Handlebars from "handlebars";
import configRoutesFunction from "./routes/index.js";
import "./utils/handlebarsHelper.js";

import userProfileRoutes from './routes/userProfileRoutes.js';

// Fix __dirname issue in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Force load .env from correct path
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

connectDB();

// Handlebars setup with eq helper
const hbs = exphbs.create({
  defaultLayout: false,
  extname: ".handlebars",
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    eq: (a, b) => a === b,
    gte: (a, b) => a >= b,
    length: (array) => (Array.isArray(array) ? array.length : 0),
    includes: (arr, val) => Array.isArray(arr) && arr.includes(val.toString()),
    json: (context) => JSON.stringify(context, null, 2),
    formatDate: (datetime) => {
      if (!datetime) return "";
      return new Date(datetime).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    formatTime: (datetime) => {
      if (!datetime) return "";
      return new Date(datetime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatDateInput: (datetime) => {
      if (!datetime) return "";
      const date = new Date(datetime);
      return date.toISOString().split("T")[0]; // yyyy-mm-dd
    },
    formatTimeInput: (datetime) => {
      if (!datetime) return "";
      const date = new Date(datetime);
      return date.toTimeString().slice(0, 5); // hh:mm
    },
  },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// for statis files
app.use(express.static(path.join(__dirname, "public")));

// always Add this middleware BEFORE your routes
app.use(cookieParser());

app.use((req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Invalidate token if it's older than server boot time
      if (decoded.iat * 1000 < serverBootTime) {
        res.clearCookie("token");
        res.locals.isLoggedIn = false;
        res.locals.username = null;
        return next();
      }

      req.user = decoded; // this line is the key
      res.locals.isLoggedIn = true;
      res.locals.username = decoded.username;
      req.user = decoded;
    } catch (err) {
      res.locals.isLoggedIn = false;
      res.locals.username = null;
      res.clearCookie("token");
    }
  } else {
    res.locals.isLoggedIn = false;
    res.locals.username = null;
  }

  next();
});

// Routes
configRoutesFunction(app);
app.use("/host", hostGameRoutes);
app.use("/gymBuddy", gymBuddyRoutes);

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

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
