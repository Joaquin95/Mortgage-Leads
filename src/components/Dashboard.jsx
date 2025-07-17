import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../services/firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";
import ChoosePlan from "./ChoosePlan";
import AdminPanel from "./AdminPanel";

const ADMIN_EMAIL = "mintinvestments95@gmail.com";
const QUOTA = { Basic: 3, Standard: 6, Premium: 10 };

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState(null);
  const [leadsUsed, setLeadsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [leads, setLeads] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [notesStatus, setNotesStatus] = useState({});
  const [pageSize] = useState(20);
  const [showTrash, setShowTrash] = useState(false);

  const getProgress = () => {
    const max = QUOTA[subscriptionType] || 0;
    const percent = Math.min((leadsUsed / max) * 100, 100);
    return { max, percent };
  };

  const { max, percent } = getProgress();
  const overQuota = subscriptionType && leadsUsed >= max;

  const patchMissingDeletedFields = useCallback(async () => {
    if (!user?.email) return;

    const snap = await getDocs(
      query(
        collection(db, "leads"),
        where("officerEmail", "==", user.email.toLowerCase())
      )
    );

    const patchPromises = snap.docs.map((docSnap) => {
      const data = docSnap.data();
      if (data.deleted === undefined) {
        return updateDoc(doc(db, "leads", docSnap.id), { deleted: false });
      }
      return Promise.resolve();
    });

    await Promise.all(patchPromises);
  }, [user]);

  const fetchLeads = useCallback(
    async (reset = false) => {
      if (!user?.email) return;

      let base = query(
        collection(db, "leads"),
        where("officerEmail", "==", user.email.toLowerCase()),
        where("deleted", "==", showTrash ? true : false)
      );

      if (filterStatus !== "All") {
        base = query(base, where("status", "==", filterStatus));
      }

      let paged = query(base, orderBy("timestamp", "desc"), limit(pageSize));
      if (!reset && lastDoc) {
        paged = query(paged, startAfter(lastDoc));
      }

      const snap = await getDocs(paged);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLeads((prev) => (reset ? docs : [...prev, ...docs]));
      setLastDoc(snap.docs[snap.docs.length - 1]);
    },
    [user, filterStatus, lastDoc, pageSize, showTrash]
  );

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(fbUser);
      if (fbUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setLoading(false);
        return;
      }

      const officerRef = doc(db, "loanOfficers", fbUser.uid);
      const unsubDoc = onSnapshot(officerRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSubscriptionType(data.subscriptionType);
          setLeadsUsed(data.leadsSentThisMonth || 0);
        }
      });

      await patchMissingDeletedFields();
      await fetchLeads(true);
      setLoading(false);

      return () => unsubDoc();
    });

    return () => unsubscribeAuth();
  }, [fetchLeads, filterStatus, patchMissingDeletedFields]);

  if (loading) return <p className="text-center">⏳ Loading dashboard...</p>;
  if (!user)
    return <p className="text-center">❌ Please log in to continue.</p>;
  if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())
    return <AdminPanel />;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">📋 Loan Officer Dashboard</h2>

      {overQuota ? (
        <div className="repurchase-container">
          <p className="text-warning">
            🚫 You’ve used all {max} leads this month. Please choose a new plan
            to continue.
          </p>
          <ChoosePlan mandatory />
        </div>
      ) : subscriptionType ? (
        <div className="subscription-card">
          <h3>Your Subscription</h3>
          <p>
            📦 Plan: <strong>{subscriptionType}</strong> ({max} leads)
          </p>
          <p>
            📈 Leads Used: <strong>{leadsUsed}</strong> / {max}
          </p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${percent}%` }} />
          </div>
        </div>
      ) : (
        <ChoosePlan />
      )}

      <div className="filter-container">
        <label>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setLastDoc(null);
            fetchLeads(true);
          }}
        >
          <option value="All">All</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Closed">Closed</option>
        </select>
        <button
          className="btn-toggle-trash"
          onClick={() => {
            setShowTrash((prev) => !prev);
            setLastDoc(null);
            fetchLeads(true);
          }}
        >
          {showTrash ? "⬅️ Back to Leads" : "🗑️ View Trash Bin"}
        </button>
      </div>

      <div className="lead-grid">
        {leads.map((lead) => (
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
                <strong>First-time Homebuyer?:</strong> {lead.homeBuyerType}
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {lead.timestamp?.toDate().toLocaleString()}
              </p>
            </div>

            <div className="card-side">
              {!showTrash ? (
                <button
                  className="btn-delete"
                  onClick={async () => {
                    const confirm = window.confirm("Delete this lead?");
                    if (confirm) {
                      await updateDoc(doc(db, "leads", lead.id), {
                        deleted: true,
                      });
                      await fetchLeads(true);
                    }
                  }}
                >
                  🗑️ Delete
                </button>
              ) : (
                <>
                  <button
                    className="btn-restore"
                    onClick={async () => {
                      await updateDoc(doc(db, "leads", lead.id), {
                        deleted: false,
                      });
                      await fetchLeads(true);
                    }}
                  >
                    ♻️ Restore
                  </button>

                  <button
                    className="btn-permanent-delete"
                    onClick={async () => {
                      const confirm = window.confirm(
                        "Permanently delete this lead?"
                      );
                      if (confirm) {
                        await deleteDoc(doc(db, "leads", lead.id));
                        await fetchLeads(true);
                      }
                    }}
                  >
                    ❌ Delete Permanently
                  </button>
                </>
              )}

              <label className="field-label">Status:</label>
              <select
                className="status-select"
                value={lead.status || "New"}
                onChange={async (e) => {
                  await updateDoc(doc(db, "leads", lead.id), {
                    status: e.target.value,
                  });
                }}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Closed">Closed</option>
              </select>

              <label className="field-label mt-2">Notes</label>
              <textarea
                className="notes-area"
                value={lead.notes || ""}
                placeholder="Add notes"
                rows={3}
                onChange={async (e) => {
                  const text = e.target.value;
                  setNotesStatus((s) => ({ ...s, [lead.id]: "saving" }));
                  await updateDoc(doc(db, "leads", lead.id), { notes: text });
                  setNotesStatus((s) => ({ ...s, [lead.id]: "saved" }));
                  setTimeout(() => {
                    setNotesStatus((s) => ({ ...s, [lead.id]: "" }));
                  }, 2000);
                }}
              />
              {notesStatus[lead.id] === "saving" && (
                <p className="text-yellow-300">🕒 Saving...</p>
              )}
              {notesStatus[lead.id] === "saved" && (
                <p className="text-green-400">✅ Saved</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={() => signOut(auth)} className="signout-btn">
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
