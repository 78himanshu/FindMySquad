import Userlist from '../models/User.js';
import { ObjectId } from 'mongodb';
import { checkNumber, checkString } from '../utils/helper.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// export const register = async (req, res) => {
//     try {
//         const { username, email, password } = req.body;
//         if (!username || !email || !password)
//             return res.status(400).json({ error: 'All fields are required' });

//         const existingUser = await User.findOne({ email });
//         if (existingUser)
//             return res.status(409).json({ error: 'Email already in use' });

//         const hashedPassword = await bcrypt.hash(password, saltRounds);
//         const newUser = new User({ username, email, password: hashedPassword });
//         await newUser.save();

//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (err) {
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// };

// export const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password)
//             return res.status(400).json({ error: 'Email and password required' });

//         const user = await User.findOne({ email });
//         if (!user) return res.status(401).json({ error: 'Invalid credentials' });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//             expiresIn: '2h',
//         });

//         res.status(200).json({
//             message: 'Login successful',
//             token,
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email,
//             },
//         });
//     } catch (err) {
//         res.status(500).json({ error: 'Login failed' });
//     }
// };

const saltRounds = 10

const isValidUsername = (username) => {
    if (username.length < 3 || username.length > 20) throw "username should me min 3 char and Max 20";
    return /^[a-zA-Z0-9]+$/.test(username);
}
const isValidPassword = (password) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);


export const login = async (email, password) => {
    if (!email || !password) {
        throw 'All fields must be provided'
    }

    const trimmedemail = checkString(email, 'email', 1)
    const trimmedpassword = checkString(password, 'password', 1)

    console.log("trimmedemail", trimmedemail)
    const user = await Userlist.findOne({ email: trimmedemail });
    console.log("user", user)
    if (!user) throw 'Invalid credentialssss';

    const isMatch = await bcrypt.compare(trimmedpassword, user.password);

    if (!isMatch) throw 'Invalid credentials';

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '2h',
    });

    let loginObject = {
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    }

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

}


export const register = async (
    username,
    email,
    password

) => {
    if (!username || !email || !password) {
        throw 'All fields must be provided'
    }

    const trimmeduserName = checkString(username, 'username', 1)
    const trimmedemail = checkString(email, 'email', 1)
    const trimmedpassword = checkString(password, 'password', 1)

    if (!isValidUsername(trimmeduserName)) {
        throw 'username can contain letters and numbers';

    }

    console.log("trimmedpassword", trimmedpassword);

    if (!isValidPassword(trimmedpassword)) {
        throw 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character';

    }

    const existingUser = await Userlist.findOne({ trimmedemail });
    if (existingUser)
        throw 'Email already in use';


    const hashedPassword = await bcrypt.hash(trimmedpassword, saltRounds);
    const newUser = new Userlist({ username, email, password: hashedPassword });
    await newUser.save();
    console.log('Register success:', newUser);
    return newUser;

}