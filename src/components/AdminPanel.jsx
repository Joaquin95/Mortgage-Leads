import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const AdminPanel = () => {
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    const fetchOfficers = async () => {
      const snap = await getDocs(collection(db, "loanOfficers"));
      setOfficers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchOfficers();
  }, []);

  const resetLeads = async (id) => {
    await updateDoc(doc(db, "loanOfficers", id), { leadsSentThisMonth: 0 });
    setOfficers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, leadsSentThisMonth: 0 } : o))
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {officers.map((officer) => (
        <div key={officer.id} className="bg-white p-4 shadow rounded mb-3">
          <p><strong>Name:</strong> {officer.name}</p>
          <p><strong>Email:</strong> {officer.email}</p>
          <p><strong>Tier:</strong> {officer.subscription}</p>
          <p><strong>Used:</strong> {officer.leadsSentThisMonth}</p>
          <button
            onClick={() => resetLeads(officer.id)}
            className="bg-red-500 text-white px-4 py-1 mt-2 rounded"
          >
            Reset Monthly Leads
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
