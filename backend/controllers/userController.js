import USER from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authUser = async (req, res) => {
  const { userID, password, role, name } = req.body;

  try {
    const user = await USER.findOne({ userID: userID });
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user.userID, user.name, user.role);
      res.status(200).json(user, token);
    }

    if (!user) {
      const hassedPassword = bcrypt.hashSync(password, 10);
      const newUser = await USER.create({
        userID,
        name,
        password: hassedPassword,
        role,
      });

      const token = generateToken(newUser.userID, newUser.name, newUser.role);
      res.status(200).json(newUser, token);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateToken = (id, name, role) => {
  return jwt.sign({ id, name, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
