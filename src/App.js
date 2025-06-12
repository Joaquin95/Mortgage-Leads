import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./components/Dashboard";
import LeadForm from "./components/LeadForm";
import AdminPanel from "./components/AdminPanel";
import OfficerSignup from "./components/OfficerSignup";
import OfficerLogin from "./components/OfficerLogin";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import "./App.css";
import { AuthProvider } from "./services/useAuth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leadform" element={<LeadForm />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/signup" element={<OfficerSignup />} />
          <Route path="/login" element={<OfficerLogin />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
