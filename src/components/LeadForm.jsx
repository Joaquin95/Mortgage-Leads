import React, { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import emailjs from "emailjs-com";

const Leadform = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    zip: "",
    loanType: "",
    loanAmount: "",
    creditScore: "",
    propertyType: "",
    occupancy: "",
    homeBuyerType: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }; // This function updates the form data state when the user types in the input fields.

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const q = query(collection(db, "loanOfficers"));
      const snapshot = await getDocs(q);

      const officers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Fetch loan officers from Firestore
      const eligible = officers.filter(
        (o) => o.leadsSentThisMonth < o.subscription
      ); // Filter eligible loan officers based on leads sent and subscription limit
      eligible.sort((a, b) => a.leadsSentThisMonth - b.leadsSentThisMonth); // Sort by leads sent

          let chosen;

      if (eligible.length > 0) {
        chosen = eligible[0]; // Choose the officer with the least leads sent

          await updateDoc(doc(db, "loanOfficers", chosen.id), {
        leadsSentThisMonth: chosen.leadsSentThisMonth + 1,
        lastLeadSent: new Date().toISOString(),
      });
        
       console.log("Chosen officer:", chosen.email);
    } else {
      // No eligible officers, use fallback (me)
      chosen = {
        email: process.env.REACT_APP_FALLBACK_OFFICER_EMAIL,
        name: process.env.REACT_APP_FALLBACK_OFFICER_NAME,
      };

      console.log("No eligible officers. Fallback to:", chosen.email);
    }
        // Send email notification using EmailJS
        await emailjs.send(
          process.env.REACT_APP_EMAILJS_SERVICE_ID,
          process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
          {
            officerEmail: chosen.email,
            officerName: chosen.name,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            loanType: formData.loanType,
            zip: formData.zip,
            creditScore: formData.creditScore,
            loanAmount: formData.loanAmount,
            propertyType: formData.propertyType,
            occupancy: formData.occupancy,
            homeBuyerType: formData.homeBuyerType,
          },
          process.env.REACT_APP_EMAILJS_PUBLIC_KEY
        );
       

        await addDoc(collection(db, "leads"), {
          ...formData,
          assignedTo: chosen.email,
          createdAt: serverTimestamp(),
        });

      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
    }
  }; // This function handles form submission, sends an email notification, and saves the lead to Firestore.
  // If the form has been submitted, show a thank you message
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <p className="text-green-700 text-xl font-semibold text-center">
          ✅ Thank you! We'll contact you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="lead-form">
      <h2 className="from-heading ">🏡 Request a Free Mortgage Quote</h2>

      <div className="form-grid">
        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          name="zip"
          placeholder="Property ZIP Code"
          value={formData.zip}
          onChange={handleChange}
          required
        />
        <input
          name="creditScore"
          placeholder="Estimated Credit Score"
          value={formData.creditScore}
          onChange={handleChange}
        />
        <input
          name="loanAmount"
          placeholder="Loan Amount"
          value={formData.loanAmount}
          onChange={handleChange}
          required
        />
        <select
          name="loanType"
          value={formData.loanType}
          onChange={handleChange}
          required
        >
          <option value="">Select Loan Type</option>
          <option>Purchase</option>
          <option>Refinance</option>
          <option>FHA</option>
          <option>VA</option>
          <option>Home Equity</option>
          <option>Home improvement</option>
        </select>
        <select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleChange}
          required
        >
          <option value="">Property Type</option>
          <option>Single Family</option>
          <option>Multi Family</option>
          <option>FHA</option>
          <option>VA</option>
          <option>Condo</option>
          <option>Manufactured or Mobile</option>
        </select>
        <select
          name="occupancy"
          value={formData.occupancy}
          onChange={handleChange}
          required
        >
          <option value="">Occupancy</option>
          <option>Primary Home</option>
          <option>Secondary Home</option>
          <option>Investment Property</option>
        </select>
        <select
          name="homeBuyerType"
          value={formData.homeBuyerType}
          onChange={handleChange}
          required
        >
          <option value="">First-time Homebuyer?</option>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>

      <button type="submit" className="submit-button">
        🚀 Get my Mortgage Quote
      </button>
    </form>
  );
};

export default Leadform;
// This component is a simple lead form for mortgage quotes.
