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
    <div className="p-4 max-w-md mx-auto">
      <h2>Sign Up</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Create Account</button>

      {/* Stripe plan buttons */}
      <div className="mt-4">
        <h3>Choose Subscription Plan</h3>
        <a href="https://checkout.stripe.com/pay/YOUR_PLAN_5_LEADS">Starter (5 Leads)</a>
        <a href="https://checkout.stripe.com/pay/YOUR_PLAN_10_LEADS">Pro (10 Leads)</a>
        <a href="https://checkout.stripe.com/pay/YOUR_PLAN_20_LEADS">Elite (20 Leads)</a>
      </div>
    </div>
  );
};

export default OfficerSignup;
