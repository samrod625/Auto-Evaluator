import USER from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authUser = async (req, res) => {
  const { userID, password, role } = req.body;

  try {
    const user = await USER.findOne({ userID, role });

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = generateToken(user.userID, user.role);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
