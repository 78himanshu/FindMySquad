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

export async function sendGameEmail(to, subject, htmlContent) {
    const mailOptions = {
        from: `"FindMySquad" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: `
          <html>
            <body style="font-family: sans-serif; line-height: 1.5;">
              <h2>🎮 Game Confirmation</h2>
              <p>${htmlContent}</p>
              <br>
              <p>Thanks,<br>FindMySquad Team</p>
            </body>
          </html>
        `,
      };
      
  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
}
