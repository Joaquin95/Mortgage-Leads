import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";

const OfficerSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "loanOfficers", res.user.uid), {
      email,
      leadsSentThisMonth: 0,
      subscription: null,
    });
    alert("Account created! Now choose a plan below.");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSignup();
      }}
      className="lead-form"
    >
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
      </div>

      <button type="submit" className="submit-button">
        Create Account
      </button>

      <div className="plan-options">
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
      </div>
    </form>
  );
};

export default OfficerSignup;
