import React, { useEffect, useState } from "react";
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
} from "firebase/auth";
import ChoosePlan from "./ChoosePlan";
import AdminPanel from "./AdminPanel";
import { signOut } from "firebase/auth";

const quota = {
  Basic: 5,
  Standard: 10,
  Premium: 20,
};

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

  const getProgress = () => {
    const max = quota[subscriptionType] || 0;
    const percent = Math.min((leadsUsed / max) * 100, 100);
    return { max, percent };
  };

  const fetchLeads = async (reset = false) => {
    if (!user?.email) return;

    let baseQuery = query(
      collection(db, "leads"),
      where("officerEmail", "==", user.email)
    );

    if (filterStatus !== "All") {
      baseQuery = query(baseQuery, where("status", "==", filterStatus));
    }

    let finalQuery = query(
      baseQuery,
      orderBy("timestamp", "desc"),
      limit(pageSize)
    );

    if (!reset && lastDoc) {
      finalQuery = query(finalQuery, startAfter(lastDoc));
    }

    const snap = await getDocs(finalQuery);
    const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setLeads(reset ? docs : [...leads, ...docs]);
    setLastDoc(snap.docs[snap.docs.length - 1]);
  };

  useEffect(() => {
    // 1-Hour Persistent Auth
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        if (
          firebaseUser.email.toLowerCase() === "mintinvestments95@gmail.com"
        ) {
          setLoading(false);
          return;
        }

        const officerRef = doc(db, "loanOfficers", firebaseUser.uid);
        const unsubDoc = onSnapshot(officerRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSubscriptionType(data.subscriptionType);
            setLeadsUsed(data.leadsSentThisMonth || 0);
          }
        });

        await fetchLeads(true);
        setLoading(false);

        return () => unsubDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [filterStatus]);

  if (loading) return <p className="text-white p-4">⏳ Loading dashboard...</p>;
  if (!user)
    return <p className="text-white p-4">❌ Please log in to continue.</p>;

  if (user.email.toLowerCase() === "mintinvestments95@gmail.com") {
    return <AdminPanel />;
  }

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
        <ChoosePlan user={user} />
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

      <button
        onClick={() => {
          window.open("https://YOUR_STRIPE_PORTAL_URL", "_blank");
        }}
        className="mt-2 mb-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
      >
        Manage Subscription
      </button>

      <button onClick={() => signOut(auth)} className="signout-btn">
        Sign Out
      </button>

      <div className="grid gap-4 md:grid-cols-2">
        {leads.map((lead) => (
          <div key={lead.id} className="lead-card">
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
              <strong>Loan Type:</strong> {lead.loanType}
            </p>
            <p>
              <strong>Loan Amount:</strong> ${lead.loanAmount}
            </p>
            <p>
              <strong>ZIP:</strong> {lead.zip}
            </p>
            <p>
              <strong>Credit Score:</strong> {lead.creditScore}
            </p>
            <p>
              <strong>Occupancy:</strong> {lead.occupancy}
            </p>
            <p>
              <strong>Submitted:</strong>{" "}
              {lead.timestamp?.toDate().toLocaleString()}
            </p>

            <label className="mt-2 block">Status:</label>
            <select
              className="text-black p-2 rounded mt-1"
              value={lead.status || "New"}
              onChange={async (e) => {
                const newStatus = e.target.value;
                await updateDoc(doc(db, "leads", lead.id), {
                  status: newStatus,
                });
              }}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Closed">Closed</option>
            </select>

            <p className="mt-4 font-semibold">Notes:</p>
            <textarea
              className="notes-area"
              value={lead.notes || ""}
              placeholder="Add notes or CRM comments"
              rows={3}
              onChange={async (e) => {
                const value = e.target.value;
                setNotesStatus((prev) => ({ ...prev, [lead.id]: "saving" }));

                await updateDoc(doc(db, "leads", lead.id), {
                  notes: value,
                });

                setNotesStatus((prev) => ({ ...prev, [lead.id]: "saved" }));

                setTimeout(() => {
                  setNotesStatus((prev) => ({ ...prev, [lead.id]: "" }));
                }, 2000);
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
