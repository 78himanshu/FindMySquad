// import express from "express";
// import path from "path";
// import { fileURLToPath } from "url";
// import configRoutesFunction from "./routes/index.js";

// const app = express();

// // Fix __dirname issue in ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(express.static(path.join(__dirname, "public")));
// configRoutesFunction(app);

// const PORT = process.env.PORT || 3000;
// console.log("We've now got a server!");
// app.listen(PORT, () => console.log("Server is running on http://localhost:3000"));


import express from 'express';
import connectDB from './config/mongoConnections.js';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userProfileRoutes from './routes/userProfileRoutes.js'; // ⬅️ New import



dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//urlencoded

connectDB(); // connect to MongoDB here


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', userProfileRoutes); // ⬅️ Register profile routes

// routes...
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

