import Test from "../models/testModel.js";
import { nanoid } from "nanoid";

export const createTest = async (req, res) => {
  try {
    const { name, description, timeLimit, questions, teacherID } = req.body;

    if (!name || !description || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    for (const question of questions) {
      if (!question.questionText || !question.marks || question.marks < 1) {
        return res.status(400).json({ message: "Invalid question format" });
      }

      if (question.type === "mcq") {
        if (!question.options || question.options.length < 2) {
          return res
            .status(400)
            .json({ message: "MCQ questions must have at least 2 options" });
        }
        if (!question.questionText || question.marks < 1) {
          return res
            .status(400)
            .json({ message: "Please select a correct option for MCQ" });
        }
      }
    }

    const code = nanoid(6).toUpperCase();

    const newTest = new Test({
      name,
      description,
      timeLimit: timeLimit || 10,
      questions,
      code,
      teacherID,
      createdAt: new Date(),
    });
    await newTest.save();
    res.status(201).json({
      success: true,
      message: "Test created successfully",
      code,
      testId: newTest._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
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

export const getAllTests = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const tests = await Test.find({ teacherID: id })
      .sort({ createdAt: -1 })
      .select("_id name createdAt questions code")
      .lean();

    const formattedTests = Array.isArray(tests) ? tests : [];

    res.status(200).json(formattedTests);
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({
      message: "Error fetching tests",
      error: error.message,
    });
  }
};

export const saveTestAttempt = async (req, res) => {
  try {
    const { testCode, answers, selectedOptions, score } = req.body;
    const studentID = req.user.id;

    if (!testCode || !answers || !selectedOptions || score === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the student has already attempted this test
    const existingAttempt = await Test.findOne({
      code: testCode,
      "studentAttempts.studentID": studentID,
    });

    if (existingAttempt) {
      return res
        .status(400)
        .json({ message: "You have already attempted this test" });
    }

    // Push the new attempt into the array
    const test = await Test.findOneAndUpdate(
      { code: testCode },
      {
        $push: {
          studentAttempts: {
            studentID,
            answers: answers.map((response, idx) => ({
              response,
              selectedOption: selectedOptions[idx],
            })),
            score,
            status: "submitted",
            submittedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(201).json({
      success: true,
      message: "Test submitted successfully",
      score,
      totalMarks: test.totalMarks,
    });
  } catch (error) {
    console.error("Error saving attempt:", error);
    res
      .status(500)
      .json({ message: "Error saving attempt", error: error.message });
  }
};

export const getAttemptedTests = async (req, res) => {
  try {
    const { id } = req.params; // studentID

    if (!id) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Find tests where the student has an attempt
    const tests = await Test.find({
      "studentAttempts.studentID": id,
    }).select("name questions studentAttempts code");

    // Format the response
    const formattedTests = tests.map((test) => {
      // Find the student's specific attempt
      const attempt = test.studentAttempts.find(
        (attempt) => attempt.studentID === id
      );
      const totalMarks = test.questions.reduce((sum, q) => sum + q.marks, 0);

      return {
        _id: test._id,
        name: test.name,
        questions: test.questions,
        attempt, // Contains score, submittedAt, etc.
        totalMarks,
      };
    });

    res.status(200).json(formattedTests);
  } catch (error) {
    console.error("Error fetching attempted tests:", error);
    res.status(500).json({
      message: "Error fetching attempted tests",
      error: error.message,
    });
  }
};

export const getTestResults = async (req, res) => {
  try {
    const { id } = req.params; // test ID

    const test = await Test.findById(id).select(
      "name questions studentAttempts"
    );

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const results = test.studentAttempts.map((attempt) => ({
      studentID: attempt.studentID,
      score: attempt.score,
      totalMarks: test.questions.reduce((sum, q) => sum + q.marks, 0),
      percentage: Math.round(
        (attempt.score / test.questions.reduce((sum, q) => sum + q.marks, 0)) *
          100
      ),
      submittedAt: attempt.submittedAt,
    }));

    res.status(200).json({
      testTitle: test.name,
      attempts: results,
    });
  } catch (error) {
    console.error("Error fetching test results:", error);
    res.status(500).json({
      message: "Error fetching test results",
      error: error.message,
    });
  }
};
