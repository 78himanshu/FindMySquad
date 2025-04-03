// ES6-style auth controller
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import helper from "../utils/Helper.js";

const saltRounds = 10;

const isValidUsername = (username) => {
  if (username.length < 3 || username.length > 20)
    throw "username should me min 3 char and Max 20";
  return /^[a-zA-Z0-9]+$/.test(username);
};
const isValidPassword = (password) =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

export const signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    username = helper.checkString(username, "username");
    email = helper.checkString(email, "email");
    password = helper.checkString(password, "password");

    if (!isValidUsername(username)) {
      return res
        .status(400)
        .json({ error: "username can contain letters and numbers" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    console.log("Register success:", newUser);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err });
  }
};

export const login = async (req, res) => {
  console.log("===>>");
  try {
    let { email, password } = req.body;
    console.log("==>", email, password);
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    email = helper.checkString(email, "email");
    password = helper.checkString(password, "password");

    const user = await User.findOne({ email });
    console.log("user", user);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
