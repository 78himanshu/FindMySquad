import jwt from "jsonwebtoken";

export default function redirectIfLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    return res.redirect(`/profile/userview/${userId}?msg=already_logged_in`);
  } catch (err) {
    return next();
  }
}