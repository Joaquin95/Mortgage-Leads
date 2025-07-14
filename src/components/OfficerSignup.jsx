import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import AOS from "aos";
import "aos/dist/aos.css";

const OfficerSignup = () => {
  const [email, setEmail] = useState("");
  const [nmls, setNMLS] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const isPasswordStrong = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;
    return regex.test(password);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isPasswordStrong(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "loanOfficers", res.user.uid), {
        email,
        nmls,
        leadsSentThisMonth: 0,
        subscription: null,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="lead-form" data-aos="zoom-in">
      <h2 className="form-heading">
        🎯 Join the Network of Verified Loan Officers
      </h2>
      <p className="text-center mb-4 text-slate-200 text-base leading-relaxed">
        TexasMortgageLeads.com is built for licensed professionals like you.
        Once verified, you'll gain access to high-intent leads, a CRM-style
        dashboard, and flexible quota-based routing. We verify each partner's
        NMLS registration to ensure professionalism and trust.
      </p>

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
            name="nmls"
            type="text"
            placeholder="NMLS Number"
            value={nmls}
            onChange={(e) => setNMLS(e.target.value)}
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
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Creating Account..." : "✅ Verify & Create Account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-400 text-center">
        Your NMLS number is used for verification only. We do not share it
        publicly.
      </p>
    </section>
  );
};

export default OfficerSignup;
