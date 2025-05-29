import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [officer, setOfficer] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Get officer's info
      const officerSnap = await getDocs(
        query(collection(db, "loanOfficers"), where("email", "==", user.email))
      );

      if (officerSnap.empty) return;

      const officerData = officerSnap.docs[0].data();
      setOfficer(officerData);

      // Fetch leads assigned to the officer
      const leadsSnap = await getDocs(
        query(collection(db, "leads"), where("assignedTo", "==", user.email))
      );

      const myLeads = leadsSnap.docs
        .map((doc) => doc.data());
      setLeads(myLeads);
    };

    fetchLeads();
  }, []);

  if (!officer) return <p>Loading dashboard...</p>

  return (
    <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome, {officer.name}</h1>
          <p>
        Subscription Tier: <strong>{officer.subscription}</strong> leads/month
      </p>
      <p>
        Leads Used: <strong>{officer.leadsSentThisMonth}</strong>
      </p>
      <p>
        Leads Remaining: <strong>{officer.subscription - officer.leadsSentThisMonth}</strong>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">My Leads</h2>
      {leads.length === 0 ? (
        <p>No leads assigned yet.</p>
      ) : ( 
      leads.map((lead, i) => (
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
      ))
      )}
    </div>
  );
};

export default Dashboard;
