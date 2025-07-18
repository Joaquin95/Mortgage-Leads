import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import AOS from "aos";
import "aos/dist/aos.css";
import ReactGA from "react-ga4";

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

    ReactGA.send({ hitType: "pageview", page: "/officer-leads" });
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
        subscriptionType: "unknown",
        subscription: null,
        monthlyQuota: 0,
        leadsSentThisMonth: 0,
        notes: "",
        subscribedAt: null,
      });
      ReactGA.event({
        category: "Officer",
        action: "Signup",
        label: "OfficerSignup",
        value: 1,
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
      <h2 className="form-heading">🚀 Ready to Fuel Your Pipeline?</h2>
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
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
          onClick={() =>
            ReactGA.event({
              category: "Officer",
              action: "Clicked Signup Button",
              label: "Signup CTA",
              value: 1,
            })
          }
        >
          {loading ? "Creating Account..." : "✅ Verify & Create Account"}
        </button>
      </form>
      <section className="signup-why">
        <h2>👍 Why Join Now?</h2>
        <ul>
          <li>
            🔥 Verified, High-Intent Leads Consumers on our site have already
            raised their hand for a mortgage quote.
          </li>
          <li>
            🛡️ Exclusive to You No shared leads, no bidding wars—you get the
            first crack at every contact.
          </li>
          <li>
            💰 Flat-Rate, Predictable Pricing One simple monthly fee, no
            per-lead nickel-and-diming.
          </li>
          <li>
            🤝 Instant CRM & Email Delivery Webhooks or Zapier—leads hit your
            inbox and your pipeline in real-time.
          </li>
          <li>
            ✅ Built-in Compliance & Reporting Fully RESPA-safe, NMLS-ready
            disclosures, and straightforward performance metrics.
          </li>
          <li>
            📈 Proven Conversion Tools Dashboard reminders, status updates, and
            email templates to turn more clicks into applications.
          </li>
          <li>
            🏆 Texas-Only, Hyper-Local Focus Leads only from Texas zip codes—no
            out-of-state tire-kickers.
          </li>
          <li> 🤝No contracts, no per-lead fees—cancel anytime.</li>
        </ul>
      </section>

      <section className="signup-how">
        <h2>🛠️ How It Works</h2>
        <ol>
          <li>
            <strong>
              Sign Up, Create your account, We'll verify your NMLS in less than
              24hrs, and then pick your plan.
            </strong>
          </li>
          <li>
            <strong>
              {" "}
              Set Your Preferences Choose between three, six or ten monthly
              leads for your pipeline.
            </strong>
          </li>
          <li>
            <strong>
              New contacts fire off to your email and CRM the moment they
              submit.
            </strong>
          </li>
          <li>
            <strong>
              Track & Optimize Use our dashboard for lead status and customize
              notes.
            </strong>
          </li>
        </ol>
      </section>
      <p className="mt-4 text-sm text-slate-400 text-center">
        Your NMLS number is used for verification only. We do not share it
        publicly.
      </p>
    </section>
  );
};

export default OfficerSignup;
