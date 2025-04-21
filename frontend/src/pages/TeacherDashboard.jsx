import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import axios from "axios";
import { ResultsModal } from "../components/ResultsModal.jsx";

const TeacherDashboard = ({ userID }) => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [loading, setLoading] = useState({
    tests: true,
    results: false,
  });
  const [error, setError] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentTestResults, setCurrentTestResults] = useState([]);
  const navigate = useNavigate();
  const COLORS = ["#0088FE", "#FFBB28", "#FF8042"];

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading((prev) => ({ ...prev, tests: true }));
        setError(null);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/dbms/test/getTests/${userID}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const formattedTests = response.data.map((test) => ({
          id: test._id,
          title: test.name,
          date: new Date(test.createdAt).toLocaleDateString(),
          questionCount: test.questions.length,
          code: test.code,
          studentAttempts: test.studentAttempts || [],
        }));

        setTests(formattedTests);

        if (formattedTests.length > 0) {
          handleTestSelect(formattedTests[0]);
        }
      } catch (error) {
        console.error("Error loading teacher data:", error);
        setError("Failed to load tests. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, tests: false }));
      }
    };

    loadTeacherData();
  }, [userID]);

  const handleTestSelect = async (test) => {
    setSelectedTest(test);
    setLoading((prev) => ({ ...prev, results: true }));
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/dbms/test/results/${test.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const results = response.data.attempts.map((attempt) => ({
        testId: test.id,
        studentId: attempt.studentID,
        name: attempt.studentID,
        score: attempt.score || 0,
        total: attempt.totalMarks || 0,
        percentage: attempt.percentage || 0,
      }));

      setStudentResults(results);
    } catch (error) {
      console.error("Error fetching test results:", error);
      setError("Failed to load test results. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, results: false }));
    }
  };

  const handleViewAllResults = async (test) => {
    try {
      setLoading((prev) => ({ ...prev, results: true }));
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/dbms/test/results/${test.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const results = response.data.attempts.map((attempt) => ({
        studentId: attempt.studentID,
        score: attempt.score || 0,
        total: attempt.totalMarks || 0,
        percentage: attempt.percentage || 0,
        submittedAt: attempt.submittedAt
          ? new Date(attempt.submittedAt).toLocaleString()
          : "N/A",
      }));

      setCurrentTestResults(results);
      setShowResultsModal(true);
    } catch (error) {
      console.error("Error fetching test results:", error);
      setError("Failed to load test results. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, results: false }));
    }
  };

  const getTestResults = (testId) => {
    return studentResults.filter((result) => result.testId === testId);
  };

  const getPerformanceData = (testId) => {
    const results = getTestResults(testId);
    if (results.length === 0) return [];

    const passed = results.filter((r) => r.percentage >= 70).length;
    const average = results.filter(
      (r) => r.percentage >= 50 && r.percentage < 70
    ).length;
    const failed = results.filter((r) => r.percentage < 50).length;

    return [
      { name: "Excellent (≥70%)", value: passed },
      { name: "Average (50-69%)", value: average },
      { name: "Needs Improvement (<50%)", value: failed },
    ].filter((item) => item.value > 0);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        {userID.toUpperCase()} Teacher Dashboard
      </h1>

      <div className="text-center mb-8">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-200"
          onClick={() => navigate("/createtest")}
        >
          Create New Test
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Tests</h2>
        {loading.tests ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tests found</p>
        ) : (
          <ul className="space-y-2">
            {tests.map((test) => (
              <li
                key={test.id}
                className={`p-4 border-b border-gray-200 ${
                  selectedTest?.id === test.id
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleTestSelect(test)}
                  >
                    <div className="font-medium">{test.title}</div>
                    <div className="text-sm text-gray-600">
                      {test.date} • {test.questionCount} questions •{" "}
                      {test.studentAttempts?.length || 0} attempts
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewAllResults(test)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded ml-4"
                  >
                    View All Scores
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showResultsModal && (
        <ResultsModal
          onClose={() => setShowResultsModal(false)}
          results={currentTestResults}
          testTitle={selectedTest?.title || "Test"}
          isLoading={loading.results}
        />
      )}

      {selectedTest && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {selectedTest.title} Results
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium mb-3">Student Performance</h4>
              <div className="overflow-x-auto">
                {loading.results ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getTestResults(selectedTest.id).length > 0 ? (
                        getTestResults(selectedTest.id).map((result) => (
                          <tr key={`${result.testId}-${result.studentId}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {result.studentId}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {result.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {result.score}/{result.total}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {result.percentage}%
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-4 py-3 text-center text-gray-500"
                          >
                            No results available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-3">
                Overall Class Performance
              </h4>
              <div className="flex justify-center">
                {loading.results ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : getPerformanceData(selectedTest.id).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No performance data available
                  </p>
                ) : (
                  <PieChart width={350} height={300}>
                    <Pie
                      data={getPerformanceData(selectedTest.id)}
                      cx={150}
                      cy={150}
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {getPerformanceData(selectedTest.id).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [value, name]}
                    />
                    <Legend />
                  </PieChart>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
