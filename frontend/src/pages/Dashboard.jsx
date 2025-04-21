// Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import decodeJWT from "../utils/Token.js";
import TeacherDashboard from "./TeacherDashboard.jsx";
import StudentDashboard from "./StudentDash.jsx";

const Dashboard = () => {
  const [role, setRole] = useState("");
  const [userID, setUserID] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check user role from JWT in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeJWT(token);
      console.log("decoded : ", decoded.id);
      if (decoded && decoded.role) {
        setRole(decoded.role);
        setUserID(decoded.id);
      }
    }
    setLoading(false);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check authentication and role
  if (!localStorage.getItem("token")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">
            You need to log in to access the dashboard
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
            onClick={() => navigate("/")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">
            Unable to determine your role. Please contact support.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return role === "teacher" ? (
    <TeacherDashboard userID={userID} />
  ) : (
    <StudentDashboard userID={userID} />
  );
};

export default Dashboard;
