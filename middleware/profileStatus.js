import { userProfileData } from "../data/index.js";

export const attachProfileStatus = async (req, res, next) => {
  if (!req.user || !req.user.userId) {
    res.locals.profileCompleted = false;
    return next();
  }

  try {
    const profile = await userProfileData.getProfile(req.user.userId);
    res.locals.profileCompleted = !!(profile?.profile?.firstName && profile?.location?.city);
  } catch (e) {
    console.error("Error checking profile completion:", e);
    res.locals.profileCompleted = false;
  }

  next();
};
