import express from 'express';
import { Router } from 'express';
import { userProfileData } from '../data/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router
  .route('/')
  .get(verifyToken, async (req, res) => {
    try {
      const profile = await userProfileData.getProfile(req.userId);
      res.status(200).json(profile);
    } catch (e) {
      res.status(404).json({ error: e.toString() });
    }
  })
  .post(verifyToken, async (req, res) => {
    try {
      const profile = await userProfileData.createProfile(req.userId, req.body);
      res.status(201).json(profile);
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  })
  .put(verifyToken, async (req, res) => {
    try {
      const updated = await userProfileData.updateProfile(req.userId, req.body);
      res.status(200).json(updated);
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  })
  .delete(verifyToken, async (req, res) => {
    try {
      await userProfileData.deleteProfile(req.userId);
      res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  });

export default router;
