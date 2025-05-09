import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendGameEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"FindMySquad" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};
