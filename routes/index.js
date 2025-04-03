import landingRoutes from "./landingRoutes.js";
import hostGamesRoutes from "./hostGamesRoutes.js"
import authRoutes from './authRoutes.js';

const configRoutesFunction = (app) => {
    app.use("/", landingRoutes);
    app.use('/host', hostGamesRoutes);
    app.use('/api/auth', authRoutes); //   /api/auth/signup    /api/auth/login   
};

export default configRoutesFunction;
