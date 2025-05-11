import { userProfileData } from "../data/index.js";

export const attachProfileStatus = async (req, res, next) => {
  if (!req.user || !req.user.userId) {
    res.locals.profileCompleted = false;
    return next();
  }

  try {
    const profile = await userProfileData.getProfile(req.user.userId);
    res.locals.profileCompleted = !!(
      profile?.profile?.firstName && profile?.location?.city
    );
  } catch (e) {
    const errorMessage =
      (typeof e === "string" && e.toLowerCase()) ||
      (typeof e?.message === "string" && e.message.toLowerCase()) ||
      "";

    const isExpected = errorMessage.includes("profile not found");

    if (!isExpected) {
      console.error(" Unexpected error in attachProfileStatus:", e);
    }

    res.locals.profileCompleted = false;
  }

  next();
};
