import React from "react";
import CreateTest from "./pages/CreateTest.jsx";
import WriteTest from "./pages/WriteTest.jsx";
import Login from "./pages/Login.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/createtest" element={<CreateTest />} />
          <Route path="/writetest" element={<WriteTest />} />
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
