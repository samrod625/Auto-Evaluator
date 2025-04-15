import bcrypt from "bcryptjs";
import USER from "../models/userModel.js";

export const authUser = async (req, res) => {
  const { type } = req.query;

  if (type == "register") {
    const { userID, name, password, role } = req.body;

    const userExists = await USER.findOne({ userID });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await USER.create({
      userID,
      name,
      password: hashedPassword,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        userID: user.userID,
        name: user.name,
        role: user.role,
      });
    }
  } else if (type === "login") {
    const { userID, password } = req.body;
    const user = await USER.findOne({ userID });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        userID: user.userID,
        name: user.name,
        role: user.role,
      });
    }
  }
};
