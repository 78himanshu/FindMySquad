import { ChannelLogStatusSummary } from "@elasticemail/elasticemail-client";
import jwt from "jsonwebtoken";

export default async function requireAuth(req, res, next) {
  try {
    let token = req.cookies.token;

    //  Fallback to Bearer token in Authorization header (for APIs/Postman/mobile)
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      const redirectTo = encodeURIComponent(req.originalUrl || "/");
      return res.redirect(`/login?redirect=${redirectTo}`);
    }

    //  Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure route handlers receive correct format
    req.user = {
      userID: decoded.userId, // Required by routes
      username: decoded.username, // Optional
      profileCompleted: decoded.profileCompleted || false,
    };
    res.locals.profileCompleted = decoded.profileCompleted || false;
    // Pass user info to Handlebars
    const userCookie = req.cookies.user;

    if (userCookie) {
      const userData = JSON.parse(userCookie);
      res.locals.isLoggedIn = true;
      res.locals.username = userData.username || "";
      res.locals.profilePic =
        userData.profilePic || "/images/default-avatar.png";
    } else {
      res.locals.isLoggedIn = true;
      res.locals.username = decoded.username || "";
      res.locals.profilePic = "/images/default-avatar.png"; // fallback
    }

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.clearCookie("token");

    return res.redirect(
      `/login?redirect=${encodeURIComponent(req.originalUrl)}`
    );
  }
}
