 import { verify } from 'jsonwebtoken';

 
export default async (req, res, next) => {
    try {
      const token = req.cookies.token;
  
      if (token) {
        const decoded = verify(token, process.env.JWT_SECRET);
        req.user = decoded; // now available as req.user
      }
  
      next();
    } catch (err) {
      console.error("Auth Middleware Error: Invalid or expired token.");
      res.clearCookie("token"); // optional: clear cookie if token is bad
      return res.redirect("/login?error=Session expired. Please log in again.");
    }
  };