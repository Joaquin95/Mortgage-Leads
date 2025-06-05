import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";

const OfficerSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "loanOfficers", res.user.uid), {
        email,
        leadsSentThisMonth: 0,
        subscription: null,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSignup} className="lead-form">
      <h2 className="form-heading">Create Loan Officer Account</h2>

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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" className="submit-button">
        Create Account
      </button>

      {/* <div className="plan-options">
        <h3>Choose a Plan</h3>
        <a
          href="https://checkout.stripe.com/pay/YOUR_PLAN_5_LEADS"
          className="plan-button green"
        >
          Starter (5 Leads)
        </a>
        <a
          href="https://checkout.stripe.com/pay/YOUR_PLAN_10_LEADS"
          className="plan-button blue"
        >
          Pro (10 Leads)
        </a>
        <a
          href="https://checkout.stripe.com/pay/YOUR_PLAN_20_LEADS"
          className="plan-button purple"
        >
          Elite (20 Leads)
        </a>
      </div> */}
    </form>
  );
};

export default OfficerSignup;
