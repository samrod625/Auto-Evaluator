import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentDashboard = ({ userID }) => {
  const [attemptedTests, setAttemptedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAttemptedTests = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/dbms/test/attempts/${userID}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const formattedTests = response.data.map((test) => {
          const attempt = test.attempt; // Now correctly mapped from the backend
          const totalMarks = test.totalMarks;

          return {
            id: test._id,
            title: test.name,
            date: new Date(attempt.submittedAt).toLocaleDateString(),
            score: attempt.score,
            total: totalMarks,
            percentage: Math.round((attempt.score / totalMarks) * 100),
          };
        });

        setAttemptedTests(formattedTests);
      } catch (error) {
        console.error("Error loading attempted tests:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAttemptedTests();
  }, [userID]);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {userID.toUpperCase()} Student Dashboard
        </h1>
        <button
          onClick={() => navigate("/writetest")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
        >
          Write Test
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Test Attempts</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : attemptedTests.length > 0 ? (
          <div className="space-y-4">
            {attemptedTests.map((test) => (
              <div
                key={test.id}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{test.title}</h3>
                    <p className="text-sm text-gray-600">
                      Attempted on: {test.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      Score: {test.score}/{test.total}
                    </p>
                    <p
                      className={`text-sm ${
                        test.percentage >= 70
                          ? "text-green-600"
                          : test.percentage >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      ({test.percentage}%)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No tests attempted yet.</p>
            <button
              onClick={() => navigate("/writetest")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              Take Your First Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
