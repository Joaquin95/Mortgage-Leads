import React, { use, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "leads"), {
      ...formData,
      createdAt: serverTimestamp(),
    });
    setSubmitted(true);
  };

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
