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