import express from 'express';
import { getTopKarmaUsers } from '../data/userProfile.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const topUsers = await getTopKarmaUsers();
    res.json(topUsers);
  } catch (e) {
    console.error('Leaderboard fetch failed:', e);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
