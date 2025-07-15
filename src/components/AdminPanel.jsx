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

const AdminPanel = () => {
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useAuth();
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "loanOfficers"));
      setOfficers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  if (!currentUser || currentUser.email.toLowerCase() !== ADMIN_EMAIL) {
    return (
      <div className="dashboard-container">
        <h2 className="dashboard-header">🔒 Access Denied</h2>
      </div>
    );
  }

  const handleFieldChange = (id, field, value) => {
    setOfficers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  const saveField = async (id, field) => {
    const value = officers.find((o) => o.id === id)?.[field] || "";
    await updateDoc(doc(db, "loanOfficers", id), { [field]: value });
  };

  const viewLeads = async (id) => {
    const officer = officers.find((o) => o.id === id);
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

  const adjustSubscription = async (id) => {
    const newPlan = prompt(
      "Enter new subscription: basic / standard / premium"
    );
    if (!newPlan) return;
    await updateDoc(doc(db, "loanOfficers", id), { subscription: newPlan });
    setOfficers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, subscription: newPlan } : o))
    );
    console.log(`📦 Subscription updated to "${newPlan}" for officer`, id);
  };
  

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">🔧 Admin Panel</h2>

      <div className="lead-grid">
        {officers.map((o) => (
          <div key={o.id} className="lead-card">
            <div className="card-col">
              <p className="officer-email">
                <strong>Officer:</strong> {o.email}
              </p>
              <p>
                <strong>Subscription:</strong> {o.subscription || "None"}
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
                type="number"
                className="nmls-input"
                min="0"
                step="1"
                value={o.nmls || ""}
                onChange={(e) =>
                  handleFieldChange(o.id, "nmls", e.target.value)
                }
                onBlur={() => saveField(o.id, "nmls")}
              />

              <label className="field-label" htmlFor={`notes-${o.id}`}>
                Notes
              </label>
              <textarea
                id={`notes-${o.id}`}
                rows={3}
                value={o.notes || ""}
                className="notes-area"
                placeholder="Admin notes..."
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
                  View Leads
                </button>
                <button
                  onClick={() => adjustSubscription(o.id)}
                  className="btn btn-manage"
                >
                  Edit Subscription
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
                    <strong>{lead.name}</strong> ({lead.email}) — {lead.status}
                    <br />
                    Amount: ${lead.loanAmount} · Credit Score: {lead.creditScore}
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
