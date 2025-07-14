import React, { useState } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";
import { app } from "../services/firebase";

const LeadForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    zip: "",
    loanType: "",
    loanAmount: "",
    creditScore: "",
    propertyType: "",
    occupancy: "",
    homeBuyerType: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const texasZipRanges = [
    [75001, 79999], // Main TX ZIP block
    [88500, 88599], // El Paso block
  ];

  const isTexasZip = (zip) => {
    const parsed = parseInt(zip, 10);
    return texasZipRanges.some(([min, max]) => parsed >= min && parsed <= max);
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    const length = digits.length;
    if (length < 4) return digits;
    if (length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData({ ...formData, [name]: formatPhone(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isTexasZip(formData.zip)) {
      alert("❌ Please enter a valid Texas ZIP code.");
      setLoading(false);
      return;
    }

    try {
      const functions = getFunctions(app);
      const sendLeadToOfficer = httpsCallable(functions, "sendLeadToOfficer");
      await sendLeadToOfficer(formData);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err.message);
      alert("❌ Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <p className="text-green-700 text-xl font-semibold text-center">
          ✅ Thank you! A top Texas Loan Officer will reach out to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="lead-form p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-slate-800">
        🏡 Request a Mortgage Quote from our Top Loan Officers!
      </h2>

      <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="p-3 rounded bg-white text-black"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="p-3 rounded bg-white text-black"
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          className="p-3 rounded bg-white text-black"
          maxLength={14}
        />
        <input
          name="loanAmount"
          placeholder="Loan Amount"
          value={formData.loanAmount}
          onChange={handleChange}
          required
          className="p-3 rounded bg-white text-black"
        />
        <input
          name="zip"
          placeholder="ZIP Code"
          value={formData.zip}
          onChange={handleChange}
          required
          className="p-3 rounded bg-white text-black"
        />
        <input
          name="creditScore"
          placeholder="Estimated Credit Score"
          value={formData.creditScore}
          onChange={handleChange}
          className="p-3 rounded bg-white text-black"
        />
        <input
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="p-3 rounded bg-white text-black"
        />

        <select
          name="loanType"
          value={formData.loanType}
          onChange={handleChange}
          required
          className="p-3 rounded bg-white text-black"
        >
          <option value="">Select Loan Type</option>
          <option>Purchase</option>
          <option>Refinance</option>
          <option>FHA</option>
          <option>VA</option>
          <option>Home Equity</option>
          <option>Home Improvement</option>
        </select>

        <select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleChange}
          required
          className="p-3 rounded bg-white text-black"
        >
          <option value="">Property Type</option>
          <option>Single Family</option>
          <option>Multi Family</option>
          <option>Condo</option>
          <option>Manufactured or Mobile</option>
          <option>Townhome</option>
        </select>

        <select
          name="occupancy"
          value={formData.occupancy}
          onChange={handleChange}
          required
          className="p-3 rounded bg-white text-black"
        >
          <option value="">Occupancy</option>
          <option>Primary Residence</option>
          <option>Secondary Residence</option>
          <option>Investment Property</option>
        </select>

        <select
          name="homeBuyerType"
          value={formData.homeBuyerType}
          onChange={handleChange}
          required
          className="p-3 rounded bg-white text-black"
        >
          <option value="">First-time Homebuyer?</option>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>

      <button type="submit" className="submit-button">
        {loading ? "Sending..." : "🚀 Get my Mortgage Quote"}
      </button>
    </form>
  );
};

export default LeadForm;
