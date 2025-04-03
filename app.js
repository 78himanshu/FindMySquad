import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/mongoConnections.js";
import dotenv from "dotenv";
import exphbs from "express-handlebars";
import fs from "fs";
import cookieParser from "cookie-parser";

import configRoutesFunction from "./routes/index.js";

dotenv.config();

// Fix __dirname issue in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
connectDB();

// Handlebars configuration
const hbs = exphbs.create({
  defaultLayout: false,
  extname: ".handlebars",
  helpers: {
    // Add any custom helpers here if needed
  },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// for statis files
app.use(express.static(path.join(__dirname, "public")));

// always Add this middleware BEFORE your routes
app.use(cookieParser());

// Routes
configRoutesFunction(app);

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
