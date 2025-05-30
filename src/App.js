import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";
import Leadform from "./components/LeadForm";
import AdminPanel from "./components/AdminPanel";
// import OfficerSignup from "./components/OfficerSignup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leadform" element={<Leadform />} />
        <Route path="/admin" element={<AdminPanel />} />
        {/* <Route path="/signup" element={<OfficerSignup />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
