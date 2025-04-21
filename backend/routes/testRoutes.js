import { authenticate } from "../middleware/authMiddleware.js";
import express from "express";
import {
  createTest,
  getTestByCode,
  getAllTests,
  saveTestAttempt,
  getAttemptedTests,
  getTestResults,
} from "../controllers/testController.js";

const router = express.Router();

router.route("/createtest").post(authenticate, createTest);
router.route("/:code").get(authenticate, getTestByCode);
router.route("/getTests/:id").get(authenticate, getAllTests);
router.route("/:code/attempt").post(authenticate, saveTestAttempt);
router.route("/attempts/:id").get(authenticate, getAttemptedTests);
router.route("/results/:id").get(authenticate, getTestResults);

export default router;
