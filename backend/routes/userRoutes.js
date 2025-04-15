import express from "express";
import { authUser } from "../controllers/userController.js";

const router = express.Router();

router.route("/auth").get(authUser).post(authUser);

export default router;
