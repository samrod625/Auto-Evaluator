import React, { useState } from "react";

const CreateTest = () => {
  const [testDetails, setTestDetails] = useState({
    testName: "",
    testDescription: "",
    totalMarks: 0,
  });

  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleTestDetailsChange = (e) => {
    const { name, value } = e.target;
    setTestDetails((prev) => ({
      ...prev,
      [name]: name === "totalMarks" ? parseInt(value) || 0 : value,
    }));
  };

  const [newQuestion, setNewQuestion] = useState({
    type: "mcq",
    questionText: "",
    marks: 1,
    options: ["", "", "", ""],
    correctOption: 0,
    keywords: "",
  });

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: name === "marks" ? parseInt(value) || 0 : value,
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
    if (newQuestion.questionText.trim() === "") return;

    if (editingIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = newQuestion;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      // Add new question
      setQuestions((prev) => [...prev, newQuestion]);
    }

    // Reset new question form
    setNewQuestion({
      type: "mcq",
      questionText: "",
      marks: 1,
      options: ["", "", "", ""],
      correctOption: 0,
      keywords: "",
    });
  };

  const editQuestion = (index) => {
    setNewQuestion(questions[index]);
    setEditingIndex(index);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all hover:shadow-xl">
          <h1 className="text-3xl font-bold text-indigo-800 mb-4">
            Create New Test
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Test Name
              </label>
              <input
                type="text"
                name="testName"
                value={testDetails.testName}
                onChange={handleTestDetailsChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Enter test name"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Test Description
              </label>
              <textarea
                name="testDescription"
                value={testDetails.testDescription}
                onChange={handleTestDetailsChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Enter test description"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Total Marks (auto-calculated)
              </label>
              <input
                type="number"
                value={calculateTotalMarks()}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">
            {editingIndex !== null
              ? `Edit Question ${editingIndex + 1}`
              : "Add New Question"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Question Type
              </label>
              <select
                name="type"
                value={newQuestion.type}
                onChange={handleQuestionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="short">Short Answer</option>
                <option value="long">Long Answer</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Question Text
              </label>
              <textarea
                name="questionText"
                value={newQuestion.questionText}
                onChange={handleQuestionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Enter your question"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Marks
              </label>
              <input
                type="number"
                name="marks"
                value={newQuestion.marks}
                onChange={handleQuestionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                min="1"
              />
            </div>

            {newQuestion.type === "mcq" && (
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium mb-1">
                  Options
                </label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={newQuestion.correctOption === index}
                      onChange={() =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          correctOption: index,
                        }))
                      }
                      className="mr-2"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {(newQuestion.type === "short" || newQuestion.type === "long") && (
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Keywords for Correct Answer (comma separated)
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={newQuestion.keywords}
                  onChange={handleQuestionChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter keywords that should be in the correct answer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Student answers will be checked for these keywords
                </p>
              </div>
            )}

            <button
              onClick={addQuestion}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all transform hover:scale-105"
            >
              {editingIndex !== null ? "Update Question" : "Add Question"}
            </button>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              Test Questions
            </h2>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50 rounded-r-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Q{index + 1}: {question.questionText}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Type: {question.type.toUpperCase()} | Marks:{" "}
                        {question.marks}
                      </p>
                      {question.type === "mcq" && (
                        <div className="mt-2 ml-4 space-y-1">
                          {question.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center">
                              <span
                                className={`inline-block w-4 h-4 rounded-full mr-2 border ${
                                  question.correctOption === optIndex
                                    ? "bg-green-500 border-green-600"
                                    : "bg-gray-200 border-gray-400"
                                }`}
                              ></span>
                              <span
                                className={
                                  question.correctOption === optIndex
                                    ? "font-medium text-green-700"
                                    : ""
                                }
                              >
                                {opt || `Option ${optIndex + 1}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {(question.type === "short" ||
                        question.type === "long") && (
                        <p className="text-sm text-gray-600 mt-1">
                          Keywords: {question.keywords}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editQuestion(index)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQuestion(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-lg font-medium text-gray-800">
                Total Questions: {questions.length} | Total Marks:{" "}
                {calculateTotalMarks()}
              </p>
              <button
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all transform hover:scale-105"
                onClick={() => alert("Test saved successfully!")}
              >
                Save Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTest;
