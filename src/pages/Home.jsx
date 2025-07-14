import React from "react";
import { Link } from "react-router-dom";
import "../App.css"; 

const Home = () => {
  return (
    <div className="home-wrapper">
      <div className="hero">
        <h1>Exclusive Texas Mortgage Leads That Convert</h1>
        <p>High-quality leads, direct from search. No contracts. No fluff.</p>
        <Link to="/leadform">
          <button className="cta-button">Get My Free Quote</button>
        </Link>
      </div>

      <section className="why-leads">
        <div className="why-content">
          <h2>Why Choose Our Leads?</h2>
          <ul>
            <li>✅ Primarily generated from Google Search – the highest intent traffic.</li>
            <li>✅ Licensed Professional Loan Officers</li>
            <li>✅ No Obligation – pay only for leads you want.</li>
            <li>✅ Pause anytime – total control over your lead flow.</li>
          </ul>
        </div>
      </section>

      <section className="trusted">
        <h3>Trusted by Professional Licensed Loan Officers</h3>
      </section>
    </div>
  );
};

export default Home;
