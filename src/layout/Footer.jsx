import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/terms" className="footer-link">
          Terms of Use
        </Link>
        {" · "}

        <Link to="/privacy" className="footer-link">
          Privacy Policy
        </Link>
        {" · "}
      </div>
      <p>© 2025 Texas Mortgage Leads. All rights reserved.</p>
      <p>
        TexasMortgageLead.com is a lead generation platform that connects Texas
        consumers with licensed mortgage loan officers. We do not take
        applications, make credit decisions, or offer loan terms. We do not
        provide mortgage advice, lending services, or financial
        recommendations.We may receive compensation from licensed loan officers
        in the form of flat-rate lead package subscriptions. This compensation
        is not tied to loan approvals, closings, or funding outcomes. We do not
        endorse or recommend any specific loan officer or lender. All loan
        inquiries are forwarded to licensed professionals. Not affiliated with
        any government agency.
      </p>
    </footer>
  );
}
