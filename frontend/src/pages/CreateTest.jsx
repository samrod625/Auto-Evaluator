import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import decodeJWT from "../utils/Token.js";

const CreateTest = () => {
  const navigate = useNavigate();
  const [testDetails, setTestDetails] = useState({
    testName: "",
    testDescription: "",
    totalMarks: 0,
    timeLimit: 10,
  });

  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [testCode, setTestCode] = useState("");
  const [isTestSaved, setIsTestSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [newQuestion, setNewQuestion] = useState({
    type: "mcq",
    questionText: "",
    marks: 1,
    options: ["", "", "", ""],
    correctOption: 0,
    keywords: "",
  });

  const resetForm = () => {
    setTestDetails({
      testName: "",
      testDescription: "",
      totalMarks: 0,
      timeLimit: 30,
    });
    setQuestions([]);
    setNewQuestion({
      type: "mcq",
      questionText: "",
      marks: 1,
      options: ["", "", "", ""],
      correctOption: 0,
      keywords: "",
    });
    setEditingIndex(null);
    setTestCode("");
    setError("");
    setIsTestSaved(false);
  };

  const handleTestDetailsChange = (e) => {
    const { name, value } = e.target;
    setTestDetails((prev) => ({
      ...prev,
      [name]:
        name === "totalMarks" || name === "timeLimit"
          ? value === ""
            ? ""
            : parseInt(value) || 0
          : value,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]:
        name === "marks" ? (value === "" ? "" : parseInt(value) || 0) : value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion((prev) => ({
      ...prev,
      options: updatedOptions,
    }));
  };

  const addQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      setError("Question text cannot be empty");
      return;
    }

    if (newQuestion.marks < 1) {
      setError("Marks must be at least 1");
      return;
    }

    if (newQuestion.type === "mcq") {
      const validOptions = newQuestion.options.filter(
        (opt) => opt.trim() !== ""
      );
      if (validOptions.length < 2) {
        setError("MCQ questions must have at least 2 non-empty options");
        return;
      }
      if (
        newQuestion.correctOption < 0 ||
        newQuestion.correctOption >= validOptions.length
      ) {
        setError("Please select a valid correct option");
        return;
      }
    }

    const questionToAdd = {
      ...newQuestion,
      marks: Math.max(1, newQuestion.marks || 1),
      options:
        newQuestion.type === "mcq"
          ? newQuestion.options.filter((opt) => opt.trim() !== "")
          : [],
    };

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = questionToAdd;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      setQuestions((prev) => [...prev, questionToAdd]);
    }

    setNewQuestion({
      type: "mcq",
      questionText: "",
      marks: 1,
      options: ["", "", "", ""],
      correctOption: 0,
      keywords: "",
    });
    setError("");
  };

  const editQuestion = (index) => {
    setNewQuestion({
      ...questions[index],
      options:
        questions[index].type === "mcq"
          ? [...questions[index].options, "", ""].slice(0, 4) // Ensure minimum 4 options for editing
          : ["", "", "", ""],
    });
    setEditingIndex(index);
    setError("");
  };

  const deleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewQuestion({
        type: "mcq",
        questionText: "",
        marks: 1,
        options: ["", "", "", ""],
        correctOption: 0,
        keywords: "",
      });
    }
  };

  const calculateTotalMarks = () => {
    return questions.reduce((sum, question) => sum + question.marks, 0);
  };

  const validateTest = () => {
    if (!testDetails.testName.trim()) {
      setError("Test name is required");
      return false;
    }

    if (!testDetails.testDescription.trim()) {
      setError("Test description is required");
      return false;
    }

    if (testDetails.timeLimit < 1) {
      setError("Time limit must be at least 1 minute");
      return false;
    }

    if (questions.length === 0) {
      setError("Please add at least one question");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} has no text`);
        return false;
      }

      if (q.marks < 1) {
        setError(`Question ${i + 1} must have at least 1 mark`);
        return false;
      }

      if (
        q.type === "mcq" &&
        q.options.filter((opt) => opt.trim() !== "").length < 2
      ) {
        setError(`Question ${i + 1} needs at least 2 options`);
        return false;
      }
    }

    return true;
  };

  const saveTest = async () => {
    if (!validateTest()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const decoded = decodeJWT(token);
      if (!token || !decoded?.id) {
        navigate("/");
        return;
      }

      // Prepare questions data for the backend
      const formattedQuestions = questions.map((q) => {
        const questionData = {
          type: q.type,
          questionText: q.questionText,
          marks: q.marks,
        };

        if (q.type === "mcq") {
          questionData.options = q.options.filter((opt) => opt.trim() !== "");
          questionData.correctOption = q.correctOption;
        } else {
          questionData.keywords = q.keywords;
        }

        return questionData;
      });

      const response = await fetch(
        "http://localhost:5000/dbms/test/createtest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: testDetails.testName,
            description: testDetails.testDescription,
            timeLimit: testDetails.timeLimit,
            questions: formattedQuestions,
            teacherID: decoded.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save test");
      }

      const data = await response.json();
      setTestCode(data.code);
      setIsTestSaved(true);
    } catch (error) {
      console.error("Error saving test:", error);
      setError(error.message || "Failed to save test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isTestSaved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-green-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Test Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Share this test code with your students:
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500 mb-1">Test Code</p>
            <p className="text-3xl font-bold text-indigo-600">{testCode}</p>
          </div>
          <button
            onClick={resetForm}
            className="w-auto mr-2 py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Another Test
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-auto py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go To Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-indigo-800 mb-6">
            Create New Test
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="testName"
                className="block text-gray-700 font-medium mb-2"
              >
                Test Name *
              </label>
              <input
                type="text"
                id="testName"
                name="testName"
                value={testDetails.testName}
                onChange={handleTestDetailsChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter test name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="timeLimit"
                className="block text-gray-700 font-medium mb-2"
              >
                Time Limit (minutes) *
              </label>
              <input
                type="number"
                id="timeLimit"
                name="timeLimit"
                min="1"
                value={testDetails.timeLimit}
                onChange={handleTestDetailsChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="testDescription"
              className="block text-gray-700 font-medium mb-2"
            >
              Test Description *
            </label>
            <textarea
              id="testDescription"
              name="testDescription"
              value={testDetails.testDescription}
              onChange={handleTestDetailsChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter test description"
              rows="3"
              required
            />
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-700">
                Total Marks: {calculateTotalMarks()}
              </h2>
              <h2 className="text-lg font-medium text-gray-700">
                Questions: {questions.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">
            {editingIndex !== null
              ? `Edit Question ${editingIndex + 1}`
              : "Add New Question"}
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="questionType"
                className="block text-gray-700 font-medium mb-2"
              >
                Question Type *
              </label>
              <select
                id="questionType"
                name="type"
                value={newQuestion.type}
                onChange={handleQuestionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="short">Short Answer</option>
                <option value="long">Long Answer</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="questionText"
                className="block text-gray-700 font-medium mb-2"
              >
                Question Text *
              </label>
              <textarea
                id="questionText"
                name="questionText"
                value={newQuestion.questionText}
                onChange={handleQuestionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your question"
                rows="3"
                required
              />
            </div>

            <div>
              <label
                htmlFor="questionMarks"
                className="block text-gray-700 font-medium mb-2"
              >
                Marks *
              </label>
              <input
                type="number"
                id="questionMarks"
                name="marks"
                min="1"
                value={newQuestion.marks}
                onChange={handleQuestionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {newQuestion.type === "mcq" && (
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Options *
                </label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name="correctOption"
                      checked={newQuestion.correctOption === index}
                      onChange={() =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          correctOption: index,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      id={`option-text-${index}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Option ${index + 1}`}
                    />
                    {newQuestion.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedOptions = [...newQuestion.options];
                          updatedOptions.splice(index, 1);
                          setNewQuestion((prev) => ({
                            ...prev,
                            options: updatedOptions,
                            correctOption:
                              prev.correctOption === index
                                ? 0
                                : prev.correctOption > index
                                ? prev.correctOption - 1
                                : prev.correctOption,
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label={`Remove option ${index + 1}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setNewQuestion((prev) => ({
                      ...prev,
                      options: [...prev.options, ""],
                    }));
                  }}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Option
                </button>
              </div>
            )}

            {(newQuestion.type === "short" || newQuestion.type === "long") && (
              <div>
                <label
                  htmlFor="keywords"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Keywords for Correct Answer (comma separated)
                </label>
                <input
                  type="text"
                  id="keywords"
                  name="keywords"
                  value={newQuestion.keywords}
                  onChange={handleQuestionChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter keywords that should be in the correct answer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Student answers will be checked for these keywords
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={addQuestion}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {editingIndex !== null ? "Update Question" : "Add Question"}
              </button>
              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setNewQuestion({
                      type: "mcq",
                      questionText: "",
                      marks: 1,
                      options: ["", "", "", ""],
                      correctOption: 0,
                      keywords: "",
                    });
                  }}
                  className="ml-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              Test Questions ({questions.length})
            </h2>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50 rounded-r-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <span className="font-bold text-gray-700 mr-2">
                          Q{index + 1}:
                        </span>
                        <p className="text-gray-800">{question.questionText}</p>
                      </div>
                      <div className="ml-6 mt-1">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded mr-2">
                          {question.type.toUpperCase()}
                        </span>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          {question.marks} mark{question.marks !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {question.type === "mcq" && (
                        <div className="ml-6 mt-2 space-y-1">
                          {question.options.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className={`flex items-center px-2 py-1 rounded ${
                                question.correctOption === optIndex
                                  ? "bg-green-50 border border-green-200"
                                  : "bg-gray-50"
                              }`}
                            >
                              <span
                                className={`inline-flex items-center justify-center w-4 h-4 rounded-full mr-2 ${
                                  question.correctOption === optIndex
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              >
                                {question.correctOption === optIndex && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 text-white"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </span>
                              <span>{opt || `Option ${optIndex + 1}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {(question.type === "short" ||
                        question.type === "long") && (
                        <div className="ml-6 mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Keywords:</span>{" "}
                            {question.keywords || "None specified"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editQuestion(index)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                        title="Edit question"
                        aria-label={`Edit question ${index + 1}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteQuestion(index)}
                        className="p-2 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                        title="Delete question"
                        aria-label={`Delete question ${index + 1}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    Total Questions: {questions.length}
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    Total Marks: {calculateTotalMarks()}
                  </p>
                </div>
                <button
                  onClick={saveTest}
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-medium text-white ${
                    isSubmitting
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Test"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTest;
