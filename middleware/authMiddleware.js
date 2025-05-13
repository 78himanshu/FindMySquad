// for create sesssion checking if user logged in
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      profilePic: decoded.profilePic || "/images/default-avatar.png",
      profileCompleted: decoded.profileCompleted || false,
    };

    next();
  } catch (err) {
    return res.redirect("/login?error=loginRequired");
  }
}
