import React from "react";
import CreateTest from "./pages/CreateTest.jsx";
import WriteTest from "./pages/WriteTest.jsx";
import Login from "./pages/Login.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/createtest" element={<CreateTest />} />
          <Route path="/writetest" element={<WriteTest />} />
          <Route path="/auth" element={<Login />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
