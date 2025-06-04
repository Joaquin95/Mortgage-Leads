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
    <div className="why-leads min-h-screen flex items-center justify-center">
      <div className="bg-[#0b1a33] p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Create Account</h2>
        <input
          className="w-full p-2 my-2 border border-gray-600 bg-black text-white rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 my-2 border border-gray-600 bg-black text-white rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="cta-button w-full"
          onClick={handleSignup}
        >
          Create Account
        </button>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-2">Choose a Plan</h3>
          <a className="block p-3 bg-green-600 text-white text-center rounded hover:bg-green-700 my-2" href="https://checkout.stripe.com/pay/YOUR_PLAN_5_LEADS">
            Starter (5 Leads)
          </a>
          <a className="block p-3 bg-blue-600 text-white text-center rounded hover:bg-blue-700 my-2" href="https://checkout.stripe.com/pay/YOUR_PLAN_10_LEADS">
            Pro (10 Leads)
          </a>
          <a className="block p-3 bg-purple-600 text-white text-center rounded hover:bg-purple-700 my-2" href="https://checkout.stripe.com/pay/YOUR_PLAN_20_LEADS">
            Elite (20 Leads)
          </a>
        </div>
      </div>
    </div>
  );
};

export default OfficerSignup;
