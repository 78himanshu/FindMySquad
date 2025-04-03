import landingRoutes from "./landingRoutes.js";
import express from 'express';
const router = express.Router();

// const configRoutesFunction = (app) => {
//   app.use("/", landingRoutes);
// };
router.get('/', (req, res) => {
    res.render('index', { title: 'FindMySquad' });
  });

router.get("/signup", (req, res) => {
  res.render("auth/signup", {
    title: "Sign Up - FindMySquad",
  });
});

//export default configRoutesFunction;
export default router;
