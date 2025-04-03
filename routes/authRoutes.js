import express from 'express';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

// router.get('/signup', (req, res) => {
//     res.render('auth/signup', {
//       title: 'Sign Up',
//       layout: false // Set to false if you're not using layouts
//     });
//   });

//   router.get('/login', (req, res) => {
//     res.render('auth/login', {
//       title: 'Login',
//       layout: false // Set to false if you're not using layouts
//     });
//   });

router.post('/signup', signup);
router.post('/login', login);

export default router;
