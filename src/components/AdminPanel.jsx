import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";

const AdminPanel = () => {
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "loanOfficers"));
      setOfficers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const resetLeads = async (id) => {
    await updateDoc(doc(db, "loanOfficers", id), { leadsSentThisMonth: 0 });
  };

  const upgradePlan = async (id, newPlan) => {
    await updateDoc(doc(db, "loanOfficers", id), { subscription: newPlan });
  };

  return (
    <div className="why-leads min-h-screen p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Panel</h1>
      {officers.map((o) => (
        <div key={o.id} className="bg-[#0b1a33] border border-gray-600 p-4 mb-4 rounded-lg">
          <p className="text-white font-medium">Email: {o.email}</p>
          <p className="text-white">Subscription: <span className="text-blue-300">{o.subscription || "None"}</span></p>
          <p className="text-white">Leads Used: {o.leadsSentThisMonth}</p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => resetLeads(o.id)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              Reset Leads
            </button>
            <button
              onClick={() => upgradePlan(o.id, "Pro")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
