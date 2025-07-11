import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import ChoosePlan from "./ChoosePlan";
import AdminPanel from "./AdminPanel";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [leadsUsed, setLeadsUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set auth persistence globally
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // If admin, skip Firestore fetch
        if (firebaseUser.email.toLowerCase() === "mintinvestments95@gmail.com") {
          setLoading(false);
          return;
        }

        const docRef = doc(db, "loanOfficers", firebaseUser.uid);

        const unsubDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSubscription(data.subscription);
            setLeadsUsed(data.leadsSentThisMonth || 0);
          } else {
            console.warn("Loan officer doc not found.");
          }
          setLoading(false);
        });

        return () => unsubDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) return <p>Loading your dashboard...</p>;
  if (!user) return <p>Please log in to view your dashboard.</p>;

  // Admin view
  if (user.email.toLowerCase() === "mintinvestments95@gmail.com") {
    return <AdminPanel />;
  }

  // Officer view
  return (
    <div className="dashboard-container">
      <h2>Welcome to Your Dashboard</h2>
      {subscription === null || subscription === undefined ? (
        <ChoosePlan user={user} />
      ) : (
        <div className="subscription-card">
          <h3>Subscription Status</h3>
          <p>📦 Plan: <strong>{subscription} Leads/month</strong></p>
          <p>📈 Leads used this month: {leadsUsed}</p>
          <button className="upgrade-btn">Upgrade Plan</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
