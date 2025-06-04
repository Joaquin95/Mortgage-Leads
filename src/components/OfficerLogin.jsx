import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const OfficerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/dashboard");
  };

  return (
     <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="lead-form">
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

      <button type="submit" className="submit-button">
        Login
      </button>
    </form>
  );
};

export default OfficerLogin;
