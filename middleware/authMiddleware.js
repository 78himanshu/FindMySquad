// for create sesssion checking if user logged in
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login?error=loginRequired");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      profilePic: decoded.profilePic || "/images/default-avatar.png",
    };

    next();
  } catch (err) {
    return res.redirect("/login?error=loginRequired");
  }
}
