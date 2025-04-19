import React, { useState } from "react";

const WriteTest = () => {
  // This would normally come from backend/API
  const [testDetails, setTestDetails] = useState({
    testName: "Sample Science Test",
    testDescription:
      "This test covers basic concepts of physics and chemistry.",
    totalMarks: 20,
    timeLimit: 30, // minutes
  });

  const [questions] = useState([
    {
      type: "mcq",
      questionText: "What is the chemical symbol for Gold?",
      marks: 2,
      options: ["Go", "Gd", "Au", "Ag"],
      correctOption: 2,
    },
    {
      type: "short",
      questionText:
        "Name the force that keeps planets in orbit around the sun.",
      marks: 3,
      keywords: "gravity,gravitational",
    },
    {
      type: "long",
      questionText:
        "Explain the difference between an element and a compound with examples.",
      marks: 5,
      keywords: "element,pure substance,compound,chemically combined,examples",
    },
  ]);

  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [selectedOptions, setSelectedOptions] = useState(
    Array(questions.length).fill(null)
  );

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[questionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const submitTest = () => {
    // Calculate score (this would be more sophisticated in a real app)
    let score = 0;
    questions.forEach((question, index) => {
      if (question.type === "mcq") {
        if (selectedOptions[index] === question.correctOption) {
          score += question.marks;
        }
      } else {
        // Simple keyword matching for demo purposes
        const keywords = question.keywords.toLowerCase().split(",");
        const answerWords = answers[index].toLowerCase().split(/\s+/);
        const matchedKeywords = keywords.filter((keyword) =>
          answerWords.some((word) => word.includes(keyword))
        );
        // Award partial marks based on keyword matches
        if (matchedKeywords.length > 0) {
          score += (matchedKeywords.length / keywords.length) * question.marks;
        }
      }
    });

    alert(
      `Test submitted! Your score: ${score.toFixed(1)}/${
        testDetails.totalMarks
      }`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all hover:shadow-xl">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">
            {testDetails.testName}
          </h1>
          <p className="text-gray-600 mb-4">{testDetails.testDescription}</p>

          <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg">
            <div>
              <span className="font-medium">Total Marks: </span>
              <span className="text-indigo-700">{testDetails.totalMarks}</span>
            </div>
            <div>
              <span className="font-medium">Time Limit: </span>
              <span className="text-indigo-700">
                {testDetails.timeLimit} minutes
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6">
            Test Questions
          </h2>

          <div className="space-y-8">
            {questions.map((question, index) => (
              <div
                key={index}
                className="border-l-4 border-indigo-500 pl-4 py-2"
              >
                <div className="mb-3">
                  <h3 className="font-medium text-gray-800">
                    Q{index + 1}: {question.questionText}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Marks: {question.marks}
                  </p>
                </div>

                {question.type === "mcq" ? (
                  <div className="space-y-2 ml-4">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center">
                        <input
                          type="radio"
                          name={`q${index}`}
                          checked={selectedOptions[index] === optIndex}
                          onChange={() => handleOptionSelect(index, optIndex)}
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="text-gray-700">{option}</label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-4">
                    <textarea
                      value={answers[index]}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder={`Type your ${question.type} answer here...`}
                      rows={question.type === "short" ? 2 : 4}
                    />
                    {question.type === "short" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Brief answer expected (1-2 sentences)
                      </p>
                    )}
                    {question.type === "long" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Detailed answer expected (paragraph)
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={submitTest}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all transform hover:scale-105"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteTest;
