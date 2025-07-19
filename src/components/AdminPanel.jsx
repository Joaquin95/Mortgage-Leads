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
  const [adminLeadCount, setAdminLeadCount] = useState(null);
  const maxActiveOfficers = 100;
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const fetchOfficers = async () => {
      const snap = await getDocs(collection(db, "loanOfficers"));

      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const active = docs.filter(
        (d) =>
          d.subscribed === true ||
          (d.subscriptionType && QUOTA[d.subscriptionType])
      );

      setActiveCount(active.length);

      const adminQuery = query(
        collection(db, "leads"),
        where("officerEmail", "==", ADMIN_EMAIL)
      );
      const adminSnap = await getDocs(adminQuery);
      setAdminLeadCount(adminSnap.size);

      const adminEntry = {
        id: "admin",
        email: ADMIN_EMAIL,
        subscriptionType: "Admin",
        monthlyQuota: "∞",
        leadsSentThisMonth: null,
        nmls: "—",
        notes: "Admin fallback account",
      };
      setOfficers([...docs, adminEntry]);
    };
    fetchOfficers();
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
    if (id === "admin") return;
    await updateDoc(doc(db, "loanOfficers", id), { [field]: value });
  };

  const viewLeads = async (officerId) => {
    const officer = officers.find((o) => o.id === officerId);
    if (!officer) return;

    const officerEmail =
      officer.email === ADMIN_EMAIL ? ADMIN_EMAIL : officer.email;
    

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
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">🔧 Admin Panel</h2>
      <p className="text-info">
        🚀 Active Loan Officers: <strong>{activeCount}</strong> /{" "}
        {maxActiveOfficers}
        {activeCount >= maxActiveOfficers && (
          <span className="badge badge-warning ml-2">Cap Reached</span>
        )}
      </p>

      <div className="lead-grid">
        {officers.map((o) => (
          <div key={o.id} className="lead-card">
            <div className="card-col">
              {(!o.subscriptionType || o.subscriptionType === "unknown") && (
                <p>
                  <span className="badge badge-warning">Unsubscribed</span>
                </p>
              )}
              {(() => {
                const isSubscribed =
                  o.subscriptionType &&
                  QUOTA[o.subscriptionType] &&
                  o.leadsSentThisMonth < QUOTA[o.subscriptionType];

                const isUnsubscribed =
                  !o.subscriptionType ||
                  !QUOTA[o.subscriptionType] ||
                  o.leadsSentThisMonth >= QUOTA[o.subscriptionType];

                if (o.id === "admin") return null;

                return isUnsubscribed ? (
                  <p>
                    <span className="badge badge-warning">Unsubscribed</span>
                  </p>
                ) : isSubscribed ? (
                  <p>
                    <span className="badge badge-success">Subscribed</span>
                  </p>
                ) : null;
              })()}
              {(o.firstName || o.lastName) && (
                <p>
                  <strong>Name:</strong> {o.firstName ?? "—"} {o.lastName ?? ""}
                </p>
              )}
              {o.phone && o.id !== "admin" && (
                <p>
                  <strong>Phone number:</strong> {o.phone}
                </p>
              )}

              <p>
                <strong>Email:</strong> {o.email}
              </p>

              <p>
                <strong>Plan:</strong>{" "}
                {o.subscriptionType && QUOTA[o.subscriptionType]
                  ? `${o.subscriptionType} (${o.monthlyQuota} leads)`
                  : o.subscriptionType || "Not Subscribed"}
              </p>

              {o.id === "admin" ? (
                <p>
                  <strong>Total Leads:</strong> {adminLeadCount ?? "—"}
                </p>
              ) : (
                <p>
                  <strong>Leads This Month:</strong> {o.leadsSentThisMonth || 0}
                </p>
              )}
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
                onChange={(e) =>
                  handleFieldChange(o.id, "nmls", e.target.value)
                }
                onBlur={() => saveField(o.id, "nmls")}
                disabled={o.id === "admin"}
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
                disabled={o.id === "admin"}
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
            <button
              className="btn btn-close"
              onClick={() => setShowModal(false)}
            >
              ❌ Close
            </button>
            <div className="modal-content">
              {selectedLeads.length === 0 ? (
                <p>No leads found.</p>
              ) : (
                <div className="lead-grid">
                  {selectedLeads.map((lead) => (
                    <div key={lead.id} className="lead-card">
                      <div className="card-col">
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
                          <strong>City:</strong> {lead.city || "—"}
                        </p>
                        <p>
                          <strong>ZIP:</strong> {lead.zip}
                        </p>
                        <p>
                          <strong>Loan Type:</strong> {lead.loanType}
                        </p>
                        <p>
                          <strong>Loan Amount:</strong> ${lead.loanAmount}
                        </p>
                        <p>
                          <strong>Credit Score:</strong> {lead.creditScore}
                        </p>
                        <p>
                          <strong>Property Type:</strong> {lead.propertyType}
                        </p>
                        <p>
                          <strong>Occupancy:</strong> {lead.occupancy}
                        </p>
                        <p>
                          <strong>First-time Homebuyer?:</strong>{" "}
                          {lead.homeBuyerType}
                        </p>
                        <p>
                          <strong>Status:</strong> {lead.status}
                        </p>
                        <p>
                          <strong>Submitted:</strong>{" "}
                          {lead.timestamp?.toDate().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
