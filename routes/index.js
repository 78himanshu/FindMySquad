import landingRoutes from "./landingRoutes.js";
import hostGamesRoutes from "./hostGamesRoutes.js"
import authRoutes from './authRoutes.js';
import userProfileRoutes from './userProfileRoutes.js';


const configRoutesFunction = (app) => {
    app.use("/", landingRoutes);
    app.use('/host', hostGamesRoutes);
    app.use('/api/auth', authRoutes); //   /api/auth/signup    /api/auth/login   
    app.use('/api/profile', userProfileRoutes); 

};

export default configRoutesFunction;
