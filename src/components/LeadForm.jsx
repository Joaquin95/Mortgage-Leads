import React, { use, useState } from "react";
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
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }; // This function updates the form data state when the user types in the input fields.

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    if (eligible.length > 0) {
      const chosen = eligible[0]; // Choose the officer with the least leads sent

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
          amount: formData.amount,
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );

      await addDoc(collection(db, "leads"), {
        ...formData,
        assignedTo: chosen.email,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "loanOfficers", chosen.id), {
        leadsSentThisMonth: chosen.leadsSentThisMonth + 1, // Increment the leads sent count for the chosen officer
        lastLeadSent: new Date().toISOString(),
      });
    }

    setSubmitted(true);
  }; // This function handles form submission, sends an email notification, and saves the lead to Firestore.
  // If the form has been submitted, show a thank you message
  if (submitted) {
    return (
      <p className="text-green-600 text-center">
        Thank you, We'll contact you soon!
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-4 bg-white shadow rounded space-y-4"
    >
      <h2 className="text-2xl font-bold mb-4">Request a Mortgage Quote</h2>

      <input
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
        type="email"
      />
      <input
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <select
        name="loanType"
        value={formData.loanType}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option>Purchase</option>
        <option>Refinance</option>
        <option>FHA</option>
        <option>VA</option>
      </select>

      <input
        name="zip"
        placeholder="Property ZIP Code"
        value={formData.zip}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        name="creditScore"
        placeholder="Estimated Credit Score"
        value={formData.creditScore}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        name="loanAmount"
        placeholder="Loan Amount"
        value={formData.loanAmount}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  );
};

export default Leadform;
// This component is a simple lead form for mortgage quotes.
