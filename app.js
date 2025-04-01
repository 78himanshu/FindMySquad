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



dotenv.config();

const app = express();
app.use(express.json());

connectDB(); // connect to MongoDB here


// Routes
app.use('/api/auth', authRoutes);

// routes...
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

