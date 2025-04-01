import landingRoutes from "./landingRoutes.js";

const configRoutesFunction = (app) => {
    app.use("/", landingRoutes);
};

export default configRoutesFunction;
