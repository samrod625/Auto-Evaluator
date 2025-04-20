import express from "express";

import { createTest, getTestByCode } from "../controllers/testController.js";
const router = express.Router();

router.route("/createtest").post(createTest);
router.route("/:code").get(getTestByCode);

export default router;
