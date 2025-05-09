import UserProfile from "../models/userProfile.js";

export async function updateKarmaPoints(userId, pointsToAdd) {
  try {
    const updatedUser = await UserProfile.findOneAndUpdate(
      { userId: userId }, // dynamic userId!
      { $inc: { karmaPoints: pointsToAdd } },
      { new: true }
    );

    if (updatedUser) {
      console.log(
        `Karma Points Updated for user ${userId}: ${updatedUser.karmaPoints}`
      );
    } else {
      console.error(`Failed to update karma points for user: ${userId}`);
    }
  } catch (error) {
    console.error(`Error updating karma points for user ${userId}:`, error);
  }
}
