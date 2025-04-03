import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/mongoConnections.js";
import dotenv from "dotenv";
import exphbs from "express-handlebars";
import session from "express-session";
import router from "./routes/index.js";
import authRouter from "./routes/authRoutes.js";
import fs from "fs";

// Initialize environment variables
dotenv.config();

// Fix __dirname issue in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
connectDB();

// Debug: Verify views directory
console.log('Views directory exists:', fs.existsSync(path.join(__dirname, 'views')));
console.log('Error template exists:', fs.existsSync(path.join(__dirname, 'views/error.handlebars')));
console.log('View files:', fs.readdirSync(path.join(__dirname, 'views')));

// Handlebars configuration
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: ".handlebars",
  helpers: {
    // Add any custom helpers here if needed
  }
});
const mainLayoutPath = path.join(__dirname, 'views/layouts/main.handlebars');
console.log('Main layout exists:', fs.existsSync(mainLayoutPath));

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Debug route to test error handling
app.get('/test-error', (req, res, next) => {
  next(new Error('This is a test error'));
});

// Routes (register after view engine setup)
app.use("/", router);
app.use("/auth", authRouter);

// 404 Handler (must come after routes but before error handler)
app.use((req, res, next) => {
  console.log('404 Handler triggered for:', req.originalUrl);
  res.status(404).render("error", {
    title: "404 Not Found",
    error: "The page you requested could not be found"
  });
});

// Error handling middleware (must come last)
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  
  // If headers already sent, delegate to default handler
  if (res.headersSent) {
    return next(err);
  }

  // For API routes, return JSON
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({ 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server Error' 
    });
  }

  // Ensure error template exists before rendering
  const errorTemplatePath = path.join(__dirname, 'views/error.handlebars');
  if (!fs.existsSync(errorTemplatePath)) {
    return res.status(500).send(`
      <h1>Server Error</h1>
      <pre>${process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'}</pre>
      <p>Error template missing at: ${errorTemplatePath}</p>
    `);
  }

  // For regular routes, render error page
  res.status(500).render("error", {
    title: "Error",
    error: process.env.NODE_ENV === "development" ? err.stack : "Something went wrong"
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});