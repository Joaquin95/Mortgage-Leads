import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./components/Dashboard";
import LeadForm from "./components/LeadForm";
import AdminPanel from "./components/AdminPanel";
import OfficerSignup from "./components/OfficerSignup";
import OfficerLogin from "./components/OfficerLogin";
import "./App.css"; // Assuming you have some global styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leadform" element={<LeadForm />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/signup" element={<OfficerSignup />} />
        <Route path="/login" element={<OfficerLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
