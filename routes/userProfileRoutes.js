import express from 'express';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
} from '../controllers/userProfileController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createUserProfile);
router.get('/', verifyToken, getUserProfile);
router.put('/', verifyToken, updateUserProfile);
router.delete('/', verifyToken, deleteUserProfile);

export default router;
