import UserProfile from '../models/userProfile.js';

// CREATE user profile
export const createUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Check if profile already exists
    const existing = await UserProfile.findOne({ userId });
    if (existing) return res.status(400).json({ error: 'Profile already exists' });

    const profileData = req.body;
    const newProfile = new UserProfile({ userId, ...profileData });
    await newProfile.save();

    res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
  } catch (err) {
    console.error('Create profile error:', err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
};

// GET current user's profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await UserProfile.findOne({ userId }).populate('userId', 'username email');
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.status(200).json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

// UPDATE current user's profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updatedFields = req.body;

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedProfile) return res.status(404).json({ error: 'Profile not found' });

    res.status(200).json({ message: 'Profile updated', profile: updatedProfile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// DELETE current user's profile
export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const deleted = await UserProfile.findOneAndDelete({ userId });

    if (!deleted) return res.status(404).json({ error: 'Profile not found' });

    res.status(200).json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete profile' });
  }
};
