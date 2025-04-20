import React, { useState, useEffect } from "react";

const WriteTest = () => {
  const [testCode, setTestCode] = useState("");
  const [testLoaded, setTestLoaded] = useState(false);
  const [testDetails, setTestDetails] = useState({
    testName: "",
    testDescription: "",
    totalMarks: 0,
    timeLimit: 0,
  });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [timerActive, setTimerActive] = useState(false);

  // Load test by code
  const loadTestByCode = async () => {
    if (!testCode.trim()) {
      alert("Please enter a test code");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/dbms/test/${testCode}`
      );
      const data = await response.json();

      if (response.ok) {
        setTestDetails({
          testName: data.name,
          testDescription: data.description,
          totalMarks: data.totalMarks,
          timeLimit: data.timeLimit,
        });
        setQuestions(data.questions);
        setAnswers(Array(data.questions.length).fill(""));
        setSelectedOptions(Array(data.questions.length).fill(null));
        setTimeLeft(data.timeLimit * 60); // Convert minutes to seconds
        setTestLoaded(true);
        setTimerActive(true);
      } else {
        throw new Error(data.message || "Test not found");
      }
    } catch (error) {
      console.error("Error loading test:", error);
      alert("Error loading test: " + error.message);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      alert("Time's up! Your test will be automatically submitted.");
      submitTest();
    }
    return () => clearInterval(interval);
  }, [timeLeft, timerActive]);

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

  const submitTest = async () => {
    setTimerActive(false); // Stop the timer

    // Calculate score
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

    // Save test attempt to database
    try {
      const response = await fetch("/api/test-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testCode,
          answers,
          selectedOptions,
          score,
          totalMarks: testDetails.totalMarks,
          timeSpent: testDetails.timeLimit * 60 - timeLeft, // in seconds
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save test attempt");
      }
    } catch (error) {
      console.error("Error saving test attempt:", error);
    }

    alert(
      `Test submitted! Your score: ${score.toFixed(1)}/${
        testDetails.totalMarks
      }`
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!testLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 mt-20">
          <h1 className="text-2xl font-bold text-indigo-800 mb-6">
            Enter Test Code
          </h1>
          <div className="flex">
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter test code"
            />
            <button
              onClick={loadTestByCode}
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
            >
              Load Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all hover:shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-indigo-800 mb-2">
                {testDetails.testName}
              </h1>
              <p className="text-gray-600 mb-4">
                {testDetails.testDescription}
              </p>
            </div>
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium">
              Time Remaining: {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg mt-4">
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
