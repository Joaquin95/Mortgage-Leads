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
    await updateDoc(doc(db, "loanOfficers", id), {
      leadsSentThisMonth: 0,
    });
  };

  const upgradePlan = async (id, newPlan) => {
    await updateDoc(doc(db, "loanOfficers", id), {
      subscription: newPlan,
    });
  };

  return (
    <div className="p-6">
      <h1>Admin Panel</h1>
      {officers.map((o) => (
        <div key={o.id} className="border p-4 mb-2 rounded">
          <p>{o.email}</p>
          <p>Subscription: {o.subscription}</p>
          <p>Leads Used: {o.leadsSentThisMonth}</p>
          <button onClick={() => resetLeads(o.id)}>Reset Leads</button>
          <button onClick={() => upgradePlan(o.id, "Pro")}>Upgrade to Pro</button>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
