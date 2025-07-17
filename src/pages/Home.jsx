import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "../App.css";

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [termYears, setTermYears] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);
  const [taxEstimate, setTaxEstimate] = useState(null);
  const [insuranceEstimate, setInsuranceEstimate] = useState(null);

  const calculateEstimates = useCallback(() => {
    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseFloat(termYears) * 12;

    if (P && r && n) {
      const basePayment =
        (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const tax = (P * 0.012) / 12;
      const insurance = 100;

      const totalMonthly = basePayment + tax + insurance;
      setMonthlyPayment(totalMonthly.toFixed(2));
      setTotalPayment((totalMonthly * n).toFixed(2));
      setTaxEstimate(tax.toFixed(2));
      setInsuranceEstimate(insurance.toFixed(2));
    } else {
      setMonthlyPayment(null);
      setTotalPayment(null);
      setTaxEstimate(null);
      setInsuranceEstimate(null);
    }
  }, [loanAmount, interestRate, termYears]);

  useEffect(() => {
    calculateEstimates();
  }, [calculateEstimates]);

  return (
    <div className="home-wrapper">
      {/* CLIENT-FACING SECTION */}
      <div className="hero" data-aos="fade-up">
        <h1>
          Find Your Perfect Texas Home and Unlock Your Homeownership Dreams
        </h1>
        <p>
          Get personalized quotes,from our vetted Loan officers and unlock your
          buying power. Just clear and honest offers.
        </p>
        <section className="lead-form" data-aos="zoom-in">
          <h2 className="form-heading">Ready to Get Started?</h2>
          <p className="text-center mb-4">
            Fill out our quick form to receive your personalized mortgage quote.
          </p>
          <Link to="/leadform">
            <button className="cta-button">📋 Get My Free Quote</button>
          </Link>
        </section>
      </div>

      <section className="why-content" data-aos="fade-up">
        <h2 className="card-heading  text-2xl md:text-3xl mb-4">
          🧠 What Is a Mortgage Quote?
        </h2>
        <p className="text-lg leading-relaxed mb-6">
          A mortgage quote estimates how much you could borrow, your interest
          rate, and what your monthly payment might look like before you apply.
        </p>
        <div className="bg-slate-700 p-4 rounded-lg shadow-md text-slate-100">
          <h3 className="text-xl font-semibold mb-2">Popular Loan Programs:</h3>

          <p className="mb-4">
            <strong className="text-blue-300">🏠 Conventional Loan:</strong>
            <br />
            Perfect for borrowers with strong credit and stable income.
            Typically requires at least <strong>3% down</strong> and offers
            competitive rates.
          </p>

          <p className="mb-4">
            <strong className="text-green-300">🛡️ FHA Loan:</strong>
            <br />
            Backed by the government and ideal for first-time buyers or credit
            scores under 680. Lower down payments, flexible qualifying terms.
          </p>

          <p className="mb-4">
            <strong className="text-yellow-300">🎖️ VA Loan:</strong>
            <br />
            Available for veterans and active military. Requires{" "}
            <strong>$0 down</strong>, includes favorable interest rates, and no
            private mortgage insurance.
          </p>

          <p className="text-lg mt-6">
            Our officers are professional and Licensed to walk you through each
            program and help compare options based on your goals and finances.
          </p>

          <Link to="/leadform">
            <button className="cta-button mt-4">
              📬 Get My Personalized Quote
            </button>
          </Link>
        </div>
      </section>

      <section className="lead-form" data-aos="zoom-in">
        <h2 className="form-heading">🧮 Estimate Your Monthly Payment</h2>
        <p className="text-center mb-4">
          Enter a few details below to see an estimated mortgage payment
          including taxes and insurance.
        </p>

        <div className="form-grid mt-6">
          <input
            type="number"
            placeholder="Loan Amount (e.g. 300000)"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="p-3 rounded bg-white text-black"
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="p-3 rounded bg-white text-black"
          />
          <input
            type="number"
            placeholder="Term Length (Years)"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            className="p-3 rounded bg-white text-black"
          />
          <input
            type="text"
            readOnly
            value={
              monthlyPayment !== null
                ? `$${monthlyPayment} /mo`
                : "Estimated Payment"
            }
            className="p-3 rounded bg-slate-200 text-black font-semibold"
          />
        </div>

        {monthlyPayment && (
          <div className="mt-6 text-slate-100">
            <p>
              <strong>Estimated Monthly Payment:</strong> ${monthlyPayment}
            </p>
            <p>
              <strong>Total Over Loan Term:</strong> ${totalPayment}
            </p>
            <p>
              <strong>Property Tax Estimate:</strong> ${taxEstimate} /mo
            </p>
            <p>
              <strong>Homeowners Insurance:</strong> ${insuranceEstimate} /mo
            </p>

            <Link to="/leadform">
              <button className="cta-button mt-4">
                📬 Request Official Quote
              </button>
            </Link>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-300 text-center">
          *This is a rough estimate. Final quote varies based on credit score,
          down payment, and location.
        </p>
      </section>

      {/* LOAN OFFICER SECTION */}
      <section
        className="why-content bg-slate-800 pt-10 pb-10 mt-12"
        data-aos="fade-up"
      >
        <h2 className="card-heading mt-6">
          📢 For Licensed Loan Officers Exclusive Texas Mortgage Leads That
          Convert
        </h2>
        <p>
          Join a lead marketplace trusted by mortgage pros across Texas. We
          deliver serious buyers ready to take action — with smart routing and
          dashboard tools.
        </p>
        <ul className="why-content-list">
          <li>📨 Leads delivered instantly to your inbox</li>
          <li>📊 CRM dashboard with built-in lead tracking and notes</li>
          <li>📦 Purchase leads in packs of 3, 6, or 10 — no contracts</li>
          <li>⏱️ Pause or upgrade anytime</li>
          <li>
            📨 High-quality leads, direct from search. No contracts. No fluff.
          </li>
        </ul>
        <section className="why-leads bg-slate-900" data-aos="fade-right">
          <div className="why-content">
            <h2 className="card-heading">
              Why Mortgage Pros Choose Texas Mortgage Leads
            </h2>
            <ul className="why-content-list">
              <li>
                ✅ Exclusive, high-intent Texas buyer leads—no cold calls, just
                prospects actively shopping.
              </li>
              <li>
                ✅ Instant lead delivery via email and dashboard so you can
                follow up in minutes.
              </li>
              <li>
                ✅ Flat-rate subscription—predictable cost, zero per-lead
                surprises.
              </li>
              <li>
                ✅ Built-in CRM tools—notes, status updates, and reminders all
                in one place.
              </li>
              <li>
                ✅ Fully RESPA-compliant and Texas-licensed—peace of mind for
                every referral.
              </li>
              <li>
                ✅ Dedicated support—concierge onboarding and 24/7
                troubleshooting to keep you selling.
              </li>
            </ul>
          </div>
        </section>
        <Link to="/officer-leads">
          <button className="cta-button">🚀 Join TexasMortgageLeads.com</button>
        </Link>
      </section>

      {/* Trusted */}
      <section className="trusted text-center" data-aos="fade-up">
        <h3>✅ Trusted by Licensed Loan Officers Across Texas</h3>
      </section>

      {/* CONTACT */}
      <section className="contact why-content" data-aos="fade-up">
        <h2 className="card-heading">Contact Us</h2>
        <p>
          Have questions? Reach out to us at{" "}
          <a href="mailto:texasmortgagelead@gmail.com" className="contact-link">
            Texasmortgagelead@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
};

export default Home;
