//import { verify } from 'jsonwebtoken';

//  import jwt from 'jsonwebtoken';


// export default async (req, res, next) => {
//     try {
//       const token = req.cookies.token;

//       if (token) {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded; // now available as req.user
//       }

//       next();
//     } catch (err) {
//       console.error("Auth Middleware Error: Invalid or expired token.");
//       res.clearCookie("token"); // optional: clear cookie if token is bad
//       return res.redirect("/login?error=Session expired. Please log in again.");
//     }
//   };


import jwt from 'jsonwebtoken';

import User from '../models/User.js';

export const ensureProfileComplete = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.session?.user?._id;

    if (!userId) {
      return res.redirect('/login');
    }

    const user = await User.findById(userId);
    if (!user || !user.profileCompleted) {
      return res.redirect('/addprofile'); // 👈 redirect to your profile route
    }

    next();
  } catch (err) {
    console.error("Error in ensureProfileComplete:", err);
    return res.status(500).send("Internal Server Error");
  }
};


export default async (req, res, next) => {
  try {
    // You might check for the token in either cookies or the Authorization header.
    // Below, we'll first check cookies, then header if no token is found.
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;         // available as req.user (if needed)
      req.userId = decoded.userId;  // assign userId for later use
    }
    next();
  } catch (err) {
    console.error("Auth Middleware Error: Invalid or expired token.", err);
    res.clearCookie("token");
    return res.redirect("/login?error=Session expired. Please log in again.");
  }
};
