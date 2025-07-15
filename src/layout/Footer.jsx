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
        Texas Mortgage Leads is not a lender or broker. We do not offer loans,
        take applications, or make credit decisions. We connect users with
        licensed mortgage professionals.
      </p>
    </footer>
  );
}
