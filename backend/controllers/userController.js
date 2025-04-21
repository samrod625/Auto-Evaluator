import USER from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authUser = async (req, res) => {
  const { userID, password, role } = req.body;

  try {
    // Check if user exists
    const user = await USER.findOne({ userID, role });

    if (user) {
      // User exists - verify password
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      // Password matches - generate token
      const token = generateToken(user.userID, user.role);
      return res.status(200).json({ token });
    } else {
      // User doesn't exist - create new user
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = new USER({
        userID,
        password: hashedPassword,
        role,
      });

      await newUser.save();

      // Generate token for new user
      const token = generateToken(newUser.userID, newUser.role);
      return res.status(201).json({ token });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
