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

    // If no token found at all, redirect to login
    // if (!token) {
    //   return res.redirect("/login?error=Please login first");
    // }
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
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.clearCookie("token");
    return res.redirect("/login?error=Session expired. Please log in again.");
  }
}
