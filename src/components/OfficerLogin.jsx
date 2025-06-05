import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const OfficerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setResetSent(false);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else {
        setError("Failed to send reset email. Try again.");
      }
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
      className="lead-form"
    >
      <h2 className="form-heading">Loan Officer Login</h2>

      <div className="form-grid">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="error">{error}</p>}
      {resetSent && (
        <p className="text-green-600 text-sm">
          ✅ Password reset email sent! Check your inbox.
        </p>
      )}

      <button type="submit" className="submit-button">
        Login
      </button>

      <div className="mt-4 text-center">
        <button
          type="button"
          className="text-blue-600 underline text-sm"
          onClick={() => setShowReset(!showReset)}
        >
          Forgot Password?
        </button>
      </div>

      {showReset && (
        <div className="mt-4">
          <button
            type="button"
            className="submit-button bg-yellow-500"
            onClick={handlePasswordReset}
            disabled={!email}
          >
            Send Reset Email
          </button>
        </div>
      )}
    </form>
  );
};

export default OfficerLogin;
