import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const navigate = useNavigate();

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("You need to be logged in to access this test");
    }
    return token;
  };

  const loadTestByCode = async () => {
    if (!testCode.trim()) {
      alert("Please enter a test code");
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(
        `http://localhost:5000/dbms/test/${testCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load test");
      }

      const data = await response.json();
      setTestDetails({
        testName: data.name,
        testDescription: data.description,
        totalMarks: data.totalMarks,
        timeLimit: data.timeLimit,
      });
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(""));
      setSelectedOptions(Array(data.questions.length).fill(null));
      setTimeLeft(data.timeLimit * 60);
      setTestLoaded(true);
      setTimerActive(true);
      setSubmissionResult(null); // Reset any previous submission results
    } catch (error) {
      console.error("Error loading test:", error);
      alert("Error loading test: " + error.message);
      if (error.message.includes("logged in")) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

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
    if (isSubmitting) return;

    setTimerActive(false);
    setIsSubmitting(true);

    // Calculate score (frontend only)
    let score = 0;
    questions.forEach((question, index) => {
      if (question.type === "mcq") {
        if (selectedOptions[index] === question.correctOption) {
          score += question.marks;
        }
      } else {
        const keywords = question.keywords?.toLowerCase().split(",") || [];
        const answerWords = answers[index]?.toLowerCase().split(/\s+/) || [];
        const matchedKeywords = keywords.filter((keyword) =>
          answerWords.some((word) => word.includes(keyword))
        );
        if (matchedKeywords.length > 0 && keywords.length > 0) {
          score += (matchedKeywords.length / keywords.length) * question.marks;
        }
      }
    });

    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/dbms/test/${testCode}/attempt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            testCode,
            answers,
            selectedOptions,
            score,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit test");
      }

      await response.json();
      setSubmissionResult({
        score,
        totalMarks: testDetails.totalMarks,
      });
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting test: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
              disabled={loading}
              className={`px-4 py-2 text-white rounded-r-lg ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Loading..." : "Load Test"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submissionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 mt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-indigo-800 mb-4">
              Test Submitted Successfully!
            </h1>
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-700">
                Your Score: {submissionResult.score.toFixed(1)}/
                {submissionResult.totalMarks}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
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
              disabled={isSubmitting}
              className={`px-8 py-3 text-white rounded-lg font-medium transition-all ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteTest;
