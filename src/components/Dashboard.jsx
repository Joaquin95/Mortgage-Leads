// src/components/Dashboard.jsx

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
const QUOTA = { Basic: 5, Standard: 10, Premium: 20 };

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState(null);
  const [leadsUsed, setLeadsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [leads, setLeads] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [notesStatus, setNotesStatus] = useState({});
  const [pageSize] = useState(10);

  // Compute progress bar values
  const getProgress = () => {
    const max = QUOTA[subscriptionType] || 0;
    const percent = Math.min((leadsUsed / max) * 100, 100);
    return { max, percent };
  };

  // Stable fetchLeads function
  const fetchLeads = useCallback(
    async (reset = false) => {
      if (!user?.email) return;

      // Build query
      let base = query(
        collection(db, "leads"),
        where("officerEmail", "==", user.email)
      );
      if (filterStatus !== "All") {
        base = query(base, where("status", "==", filterStatus));
      }

      let paged = query(base, orderBy("timestamp", "desc"), limit(pageSize));
      if (!reset && lastDoc) {
        paged = query(paged, startAfter(lastDoc));
      }

      // Fetch and update state
      const snap = await getDocs(paged);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLeads((prev) => (reset ? docs : [...prev, ...docs]));
      setLastDoc(snap.docs[snap.docs.length - 1]);
    },
    [user, filterStatus, lastDoc, pageSize]
  );

  // Auth & data listener
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(fbUser);
      // If admin, skip fetching leads
      if (fbUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setLoading(false);
        return;
      }

      // Listen to loanOfficer doc changes
      const officerRef = doc(db, "loanOfficers", fbUser.uid);
      const unsubDoc = onSnapshot(officerRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSubscriptionType(data.subscription);
          setLeadsUsed(data.leadsSentThisMonth || 0);
        }
      });

      // Initial leads fetch
      await fetchLeads(true);
      setLoading(false);

      return () => unsubDoc();
    });

    return () => unsubscribeAuth();
  }, [fetchLeads, filterStatus]);

  // Loading / auth guard
  if (loading) {
    return <p className="text-white p-4">⏳ Loading dashboard...</p>;
  }
  if (!user) {
    return <p className="text-white p-4">❌ Please log in to continue.</p>;
  }
  // Admin view
  if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return <AdminPanel />;
  }

  // User view
  const { max, percent } = getProgress();

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
      <h2 className="text-2xl font-bold mb-6">📋 Loan Officer Dashboard</h2>

      {subscriptionType ? (
        <div className="bg-slate-700 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-2">Your Subscription</h3>
          <p>
            📦 Plan: <strong>{subscriptionType}</strong> ({max} leads/month)
          </p>
          <p>
            📈 Leads Used: <strong>{leadsUsed}</strong> / {max}
          </p>
          <div className="w-full bg-gray-600 h-4 rounded mt-2">
            <div
              className="bg-green-500 h-4 rounded"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : (
        <ChoosePlan />
      )}

      <div className="mb-4">
        <label className="mr-2 text-white">Filter by Status:</label>
        <select
          className="text-black p-2 rounded"
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
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => window.open("https://YOUR_STRIPE_PORTAL_URL", "_blank")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Manage Subscription
        </button>
        <button
          onClick={() => signOut(auth)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {leads.map((lead) => (
          <div key={lead.id} className="lead-card p-4 bg-slate-700 rounded-lg">
            <p><strong>Name:</strong> {lead.name}</p>
            <p><strong>Email:</strong> {lead.email}</p>
            <p><strong>Phone:</strong> {lead.phone}</p>
            <p><strong>City:</strong> {lead.city || "—"}</p>
            <p><strong>ZIP:</strong> {lead.zip}</p>
            <p><strong>Loan Type:</strong> {lead.loanType}</p>
            <p><strong>Loan Amount:</strong> ${lead.loanAmount}</p>
            <p><strong>Credit Score:</strong> {lead.creditScore}</p>
            <p><strong>Property Type:</strong> {lead.propertyType}</p>
            <p><strong>Occupancy:</strong> {lead.occupancy}</p>
            <p><strong>Home Buyer Type:</strong> {lead.homeBuyerType}</p>
            <p>
              <strong>Submitted:</strong>{" "}
              {lead.timestamp?.toDate().toLocaleString()}
            </p>

            <label className="mt-4 block text-white font-medium">Status:</label>
            <select
              className="text-black p-2 rounded mt-1 w-full"
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

            <p className="mt-4 font-semibold">Notes:</p>
            <textarea
              className="notes-area w-full p-2 rounded bg-slate-800 text-white"
              value={lead.notes || ""}
              placeholder="Add notes or CRM comments"
              rows={3}
              onChange={async (e) => {
                const text = e.target.value;
                setNotesStatus((s) => ({ ...s, [lead.id]: "saving" }));
                await updateDoc(doc(db, "leads", lead.id), { notes: text });
                setNotesStatus((s) => ({ ...s, [lead.id]: "saved" }));
                setTimeout(
                  () => setNotesStatus((s) => ({ ...s, [lead.id]: "" })),
                  2000
                );
              }}
            />
            {notesStatus[lead.id] === "saving" && (
              <p className="text-yellow-300 mt-1 text-sm">🕒 Saving...</p>
            )}
            {notesStatus[lead.id] === "saved" && (
              <p className="text-green-400 mt-1 text-sm">✅ Saved</p>
            )}
          </div>
        ))}
      </div>

      {lastDoc && (
        <button
          onClick={() => fetchLeads()}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Load More Leads
        </button>
      )}
    </div>
  );
};

export default Dashboard;