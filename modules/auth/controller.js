import { compare, hash } from 'bcrypt';
import { User } from '../../models/userModel.js';
import jwt from 'jsonwebtoken';

export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    
    const SALT_ROUNDS = 10

    if (!name || !email || !password) {
      return res.status(400).json({
        error: { message: "Missing required fields"},
      })
    }
    
    const user = await User.create({
      name,
      email,
      passwordHash: await hash(password, SALT_ROUNDS),
    })

    const token = jwt.sign(
      {id: user._id, email: user.email},
      process.env.JWT_SECRET
    )

    return res.status(201).json({
      success: {
        message: "User registered succesfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      }
    })
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      error: {
        message: "Unable to register user",
        datails: error,
      }
    })
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: {
          message: "Invalid email or password"
        }
      })
    }

    const passwordMatch = await compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: {
          message: "Invalid email or password"
        }
      })
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET
    )

    return res.status(200).json({
      success: {
        message: "Login succesfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      }
    })
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      error: {
        message: "Unable to login user",
        details: error,
      }
    })
  }
}

export async function logoutUser(req, res) {
  try {
    return res.status(200).json({
      success: {
        message: "User logged out succesfully, "
      }
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: {
        message: "Something went wrong during logout"
      }
    })
  }
}