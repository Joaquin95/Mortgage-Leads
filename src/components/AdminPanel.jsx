import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../services/useAuth";

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, "loanOfficers"));
        setOfficers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching loan officers:", err);
      }
    };
    fetchData();
  }, []);

  const resetLeads = async (id) => {
    try {
      await updateDoc(doc(db, "loanOfficers", id), { leadsSentThisMonth: 0 });
    } catch (err) {
      console.error("Error resetting leads:", err);
    }
  };

  const upgradePlan = async (id, newPlan) => {
    try {
      await updateDoc(doc(db, "loanOfficers", id), { subscription: newPlan });
    } catch (err) {
      console.error("Error upgrading plan:", err);
    }
  };

  if (!currentUser || currentUser.email !== "Mintinvestments95@gmail.com") {
    return <p className="text-white p-4">❌ Access Denied</p>;
  }

  return (
    <div className="why-leads min-h-screen p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Panel</h1>
      {officers.map((o) => (
        <div
          key={o.id}
          className="bg-[#0b1a33] border border-gray-600 p-4 mb-4 rounded-lg"
        >
          <p className="text-white font-medium">Email: {o.email}</p>
          <p className="text-white">
            Subscription:{" "}
            <span className="text-blue-300">{o.subscription || "None"}</span>
          </p>
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
