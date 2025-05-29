import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const Dashboard = () => {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Get officer's ZIPs
      const officerSnap = await getDocs(
        query(collection(db, "loanOfficers"), where("email", "==", user.email))
      );

      if (officerSnap.empty) return;

      const zipCodes = officerSnap.docs[0].data().zipCodes;

      // Fetch leads that match those ZIPs
      const leadsSnap = await getDocs(collection(db, "leads"));
      const matched = leadsSnap.docs
        .map((doc) => doc.data())
        .filter((lead) => zipCodes.includes(lead.zip));

      setLeads(matched);
    };

    fetchLeads();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Leads</h1>
      {leads.map((lead, i) => (
        <div key={i} className="bg-white p-4 mb-2 shadow rounded">
          <p>
            <strong>Name:</strong> {lead.name}
          </p>
          <p>
            <strong>Email:</strong> {lead.email}
          </p>
          <p>
            <strong>Phone:</strong> {lead.phone}
          </p>
          <p>
            <strong>ZIP:</strong> {lead.zip}
          </p>
          <p>
            <strong>Amount:</strong> ${lead.amount}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
