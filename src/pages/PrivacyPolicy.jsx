import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="page-container">
      <h1>Privacy Policy</h1>
      <p>
        At Texas Mortgage Leads, we respect your privacy. This policy explains
        what information we collect, how we use it, and your rights.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>
          Basic contact info: name, email, phone, ZIP code, estimated credit
          score.
        </li>
        <li>Mortgage preferences: loan amount, property type, occupancy.</li>
      </ul>

      <h2>How We Use Your Data</h2>
      <ul>
        <li>
          To connect you with licensed mortgage professionals who can provide
          quotes.
        </li>
        <li>
          To send you rate alerts or important updates if you opt in.
        </li>
      </ul>

      <h2>Data Sharing & Security</h2>
      <ul>
        <li>
          We never pull credit reports, request Social Security numbers, or
          collect sensitive financial data.
        </li>
        <li>
          Your data is stored securely in Firebase with strict security rules.
        </li>
        <li>
          We only share your info with Texas-licensed loan officers.
        </li>
      </ul>

      <h2>Your Rights</h2>
      <p>
        You can request to view or delete your personal data by emailing us at{" "}
        <a href="mailto:privacy@texasmortgagelead.com">
          privacy@texasmortgageleads.com
        </a>.
      </p>
    </div>
  );
}