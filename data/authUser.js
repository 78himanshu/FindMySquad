import Userlist from "../models/User.js";
import { ObjectId } from "mongodb";
import { checkNumber, checkString } from "../utils/Helper.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10;

const isValidUsername = (username) => {
  if (username.length < 3 || username.length > 20)
    throw "username should me min 3 char and Max 20";
  return /^[a-zA-Z0-9]+$/.test(username);
};

const isValidPassword = (password) =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

export const login = async (email, password) => {
  if (!email || !password) {
    throw "All fields must be provided";
  }

  const trimmedemail = checkString(email, "email", 1);
  const trimmedpassword = checkString(password, "password", 1);

  console.log("trimmedemail", trimmedemail);
  const user = await Userlist.findOne({ email: trimmedemail });
  console.log("user", user);
  if (!user) throw "Invalid credentialssss";

  const isMatch = await bcrypt.compare(trimmedpassword, user.password);

  if (!isMatch) throw "Invalid credentials";

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  let loginObject = {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };

  return loginObject;

  // res.status(200).json({
  //     message: 'Login successful',
  //     token,
  //     user: {
  //         id: user._id,
  //         username: user.username,
  //         email: user.email,
  //     },
  // });
};

export const signup = async (username, email, password) => {
  if (!username || !email || !password) {
    throw "All fields must be provided";
  }

  const trimmeduserName = checkString(username, "username", 1);
  const trimmedemail = checkString(email, "email", 1);
  const trimmedpassword = checkString(password, "password", 1);

  if (!isValidUsername(trimmeduserName)) {
    throw "username can contain letters and numbers";
  }

  console.log("trimmedpassword", trimmedpassword);

  if (!isValidPassword(trimmedpassword)) {
    throw "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character";
  }

  const existingUser = await Userlist.findOne({ trimmedemail });
  if (existingUser) throw "Email already in use";

  const hashedPassword = await bcrypt.hash(trimmedpassword, saltRounds);
  const newUser = new Userlist({ username, email, password: hashedPassword });
  await newUser.save();
  console.log("Register success:", newUser);
  return newUser;
};
