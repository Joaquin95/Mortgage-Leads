import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./components/Dashboard";
import LeadForm from "./components/LeadForm";
import AdminPanel from "./components/AdminPanel";
import OfficerSignup from "./components/OfficerSignup";
import OfficerLogin from "./components/OfficerLogin";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import "./App.css";
import { AuthProvider, useAuth } from "./services/useAuth";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "./services/firebase";

setPersistence(auth, browserLocalPersistence).catch(console.error);

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser?.email === "Mintinvestments95@gmail.com" ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/leadform" element={<LeadForm />} />
      <Route path="/login" element={<OfficerLogin />} />
      <Route path="/signup" element={<OfficerSignup />} />  

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
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
