// controllers/testController.js
import Test from "../models/testModel.js"; // adjust path as needed
import { nanoid } from "nanoid";

export const createTest = async (req, res) => {
  try {
    const { name, description, timeLimit, questions } = req.body;

    if (!name || !description || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const code = nanoid(6); // generates a short unique test code

    const newTest = new Test({
      name,
      description,
      timeLimit,
      questions,
      code,
    });

    await newTest.save();
    res.status(201).json({ message: "Test created", code });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getTestByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const test = await Test.findOne({ code });

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const totalMarks = test.questions.reduce((sum, q) => sum + q.marks, 0);

    res.status(200).json({
      name: test.name,
      description: test.description,
      timeLimit: test.timeLimit,
      questions: test.questions,
      totalMarks,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching test", error: error.message });
  }
};
