// import { verify } from 'jsonwebtoken';

// export default async (req, res, next) => {
//   try {
//     const token = req.cookies.token;
//     if (token) {
//       req.user = verify(token, process.env.JWT_SECRET);
//     }
//     next();
//   } catch (err) {
//     next();
//   }
// };

import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login'); // user must be logged in
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 👈 store user info in request object
    next();
  } catch (err) {
    return res.redirect('/login');
  }
};