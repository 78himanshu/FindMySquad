import cron from "node-cron";
import { sendGameEmail } from "./mailer.js";
import Reminder from "./models/Reminder.js";

const scheduledJobs = new Map();

export const scheduleJobFromReminder = (reminder) => {
  if (reminder.sent) return;

  const rTime = new Date(reminder.reminderTime);
  if (rTime < new Date()) return; // skip past reminders

  const cronTime = `${rTime.getMinutes()} ${rTime.getHours()} ${rTime.getDate()} ${
    rTime.getMonth() + 1
  } *`;

  const job = cron.schedule(cronTime, async () => {
    await sendGameEmail(
      reminder.userEmail,
      `Reminder: ${reminder.gameTitle}`,
      `Reminder: Your game "${reminder.gameTitle}" starts at ${reminder.gameStartTime} at ${reminder.gameLocation}.`
    );

    await Reminder.findByIdAndUpdate(reminder._id, { sent: true });
    job.stop();
  });

  scheduledJobs.set(reminder._id.toString(), job);
};

export const scheduleAllPendingReminders = async () => {
  const reminders = await Reminder.find({ sent: false });
  reminders.forEach(scheduleJobFromReminder);
};
