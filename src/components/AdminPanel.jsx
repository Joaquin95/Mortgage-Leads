import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useAuth } from "../services/useAuth";

const ADMIN_EMAIL = "mintinvestments95@gmail.com";
const QUOTA = { Basic: 3, Standard: 6, Premium: 10 };

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const [officers, setOfficers] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch all loan officers once on mount
  useEffect(() => {
    const fetchOfficers = async () => {
      const snap = await getDocs(collection(db, "loanOfficers"));
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOfficers(docs);
    };
    fetchOfficers();
  }, []);

  // Deny access unless admin
  if (!currentUser || currentUser.email.toLowerCase() !== ADMIN_EMAIL) {
    return (
      <div className="dashboard-container">
        <h2 className="dashboard-header">🔒 Access Denied</h2>
      </div>
    );
  }

  // Handle inline field edits
  const handleFieldChange = (id, field, value) => {
    setOfficers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  // Persist a single field back to Firestore
  const saveField = async (id, field) => {
    const value = officers.find((o) => o.id === id)?.[field] || "";
    await updateDoc(doc(db, "loanOfficers", id), { [field]: value });
  };

  // View last 20 leads for a given officer
  const viewLeads = async (officerId) => {
    const officer = officers.find((o) => o.id === officerId);
    if (!officer) return;

    const q = query(
      collection(db, "leads"),
      where("officerEmail", "==", officer.email),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const snap = await getDocs(q);
    const leadData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setSelectedLeads(leadData);
    setShowModal(true);
  };

  // const adjustSubscription = async (id) => {    *************This code is for editing the subscription tier of an officer*************
  //   const newTier = prompt(
  //     "Enter new subscription tier: Basic / Standard / Premium"
  //   );
  //   if (!newTier || !QUOTA[newTier]) return alert("Invalid plan name");
  //   await updateDoc(doc(db, "loanOfficers", id), {
  //     subscriptionType: newTier,
  //     monthlyQuota: QUOTA[newTier],
  //     leadsSentThisMonth: 0,
  //   });
  //   setOfficers((prev) =>
  //     prev.map((o) =>
  //       o.id === id
  //         ? { ...o, subscriptionType: newTier, monthlyQuota: QUOTA[newTier], leadsSentThisMonth: 0 }
  //         : o
  //     )
  //   );
  // }; 

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">🔧 Admin Panel</h2>

      <div className="lead-grid">
        {officers.map((o) => (
          <div key={o.id} className="lead-card">
            <div className="card-col">
              <p>
                <strong>Email:</strong> {o.email}
              </p>
              <p>
                <strong>Plan:</strong>{" "}
                {o.subscriptionType && QUOTA[o.subscriptionType]
                  ? `${o.subscriptionType} (${o.monthlyQuota} leads)`
                  : "Not Subscribed"}
              </p>
              <p>
                <strong>Leads This Month:</strong> {o.leadsSentThisMonth || 0}
              </p>
            </div>

            <div className="card-side">
              <label className="field-label" htmlFor={`nmls-${o.id}`}>
                NMLS #
              </label>
              <input
                id={`nmls-${o.id}`}
                type="text"
                className="nmls-input"
                value={o.nmls || ""}
                onChange={(e) => handleFieldChange(o.id, "nmls", e.target.value)}
                onBlur={() => saveField(o.id, "nmls")}
              />

              <label className="field-label" htmlFor={`notes-${o.id}`}>
                Admin Notes
              </label>
              <textarea
                id={`notes-${o.id}`}
                rows={3}
                className="notes-area"
                placeholder="Enter any notes..."
                value={o.notes || ""}
                onChange={(e) =>
                  handleFieldChange(o.id, "notes", e.target.value)
                }
                onBlur={() => saveField(o.id, "notes")}
              />

              <div className="controls">
                <button
                  onClick={() => viewLeads(o.id)}
                  className="btn btn-manage"
                >
                  📋 View Leads
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={() => signOut(auth)} className="btn btn-signout">
          Sign Out
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>📋 Leads for Selected Officer</h3>
            <button className="btn btn-close" onClick={() => setShowModal(false)}>
              ❌ Close
            </button>
            <div className="modal-content">
              {selectedLeads.length === 0 ? (
                <p>No leads found.</p>
              ) : (
                <ul>
                  {selectedLeads.map((lead) => (
                    <li key={lead.id} className="modal-lead">
                      <strong>{lead.name}</strong> — {lead.email} —{" "}
                      {lead.status}
                      <br />
                      Amount: ${lead.loanAmount} · Score: {lead.creditScore}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;