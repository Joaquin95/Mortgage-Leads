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
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/leadform" element={<LeadForm />} />
      <Route path="/login" element={<OfficerLogin />} />
      <Route path="/officer-leads" element={<OfficerSignup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <AppRoutes />
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;