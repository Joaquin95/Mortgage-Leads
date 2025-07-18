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
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import ReactGA from "react-ga4";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

ReactGA.initialize("G-BW7QVTF32X");
ReactGA.send("pageview");

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return null;
}


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/leadform" element={<LeadForm />} />
      <Route path="/login" element={<OfficerLogin />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />;
      <Route path="/terms" element={<TermsOfUse />} />;
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
        <PageTracker />
        <div className="app-layout">
          <Header />
          <main className="main-content">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
