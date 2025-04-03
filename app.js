import express from 'express';
import connectDB from './config/mongoConnections.js';
import dotenv from 'dotenv';
import configRoutesFunction from './routes/index.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB(); // connect to MongoDB here

// Routes
configRoutesFunction(app);

// routes...
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

