import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userType, setUserType] = useState("student");
  const [credentials, setCredentials] = useState({
    userId: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.userId.trim()) newErrors.userId = "User ID is required";
    if (!credentials.password) newErrors.password = "Password is required";
    else if (credentials.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const response = await fetch("http://localhost:5000/dbms/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: credentials.userId,
          password: credentials.password,
          role: userType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors({ general: data.message || "Authentication failed" });
      } else {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "Something went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(to bottom right, #DBEAFE, #BFDBFE)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div
            style={{
              background: "linear-gradient(to right, #1E40AF, #5B21B6)",
            }}
            className="p-6 text-center"
          >
            <h1 className="text-3xl font-bold text-white">
              <img
                src="testhive-logo.png"
                alt="Logo"
                className="w-16 h-16 inline text-white"
              />
              TestHive
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => setUserType("student")}
                style={{
                  backgroundColor:
                    userType === "student" ? "#DBEAFE" : "#F3F4F6",
                  color: userType === "student" ? "#1D4ED8" : "#4B5563",
                  boxShadow:
                    userType === "student"
                      ? "inset 0 2px 4px rgba(0,0,0,0.1)"
                      : "none",
                }}
                className="px-4 py-2 rounded-lg font-medium transition-all"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setUserType("teacher")}
                style={{
                  backgroundColor:
                    userType === "teacher" ? "#EDE9FE" : "#F3F4F6",
                  color: userType === "teacher" ? "#7C3AED" : "#4B5563",
                  boxShadow:
                    userType === "teacher"
                      ? "inset 0 2px 4px rgba(0,0,0,0.1)"
                      : "none",
                }}
                className="px-4 py-2 rounded-lg font-medium transition-all"
              >
                Teacher
              </button>
            </div>

            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {userType === "teacher" ? "Teacher ID" : "Student ID"}
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={credentials.userId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.userId ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:outline-none transition-all`}
                placeholder={`Enter ${userType} ID`}
                pattern="[a-z]{3}[0-9]{2}[a-z]{2}[0-9]{3}"
                title="Format: 3 lowercase letters, 2 digits, 2 lowercase letters, 3 digits (e.g., nnm23cs283)"
              />
              {errors.userId && (
                <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:outline-none transition-all`}
                  placeholder="Enter your password"
                />
                <span
                  className="absolute top-2 right-3 text-sm text-blue-600 cursor-pointer select-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <div className="text-red-600 text-center font-bold text-l -mt-4">
                {errors.general}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{
                  backgroundColor:
                    userType === "teacher" ? "#7C3AED" : "#3B82F6",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.75 : 1,
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    {userType === "teacher" ? "Signing in..." : "Signing in..."}
                  </>
                ) : userType === "teacher" ? (
                  "Sign in as Teacher"
                ) : (
                  "Sign in as Student"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
