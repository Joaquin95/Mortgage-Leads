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

  // Apply persistence only once at app start
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) =>
      console.error("Persistence error:", err)
    );
  }, []);

  // Detect auth and set real-time subscription info
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Show admin panel
        if (
          firebaseUser.email &&
          firebaseUser.email.toLowerCase() === "mintinvestments95@gmail.com"
        ) {
          setLoading(false);
          return;
        }

        // Listen for changes in Firestore
        const docRef = doc(db, "loanOfficers", firebaseUser.uid);
        const unsubscribeSnap = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSubscription(data.subscription);
            setLeadsUsed(data.leadsSentThisMonth || 0);
          }
          setLoading(false);
        });

        return () => unsubscribeSnap();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Refresh after Stripe success to reload updated subscription
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      setTimeout(() => {
        window.location.href = "/dashboard"; // remove ?success from URL
      }, 1000);
    }
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in.</p>;

  if (user.email.toLowerCase() === "mintinvestments95@gmail.com") {
    return <AdminPanel />;
  }

  return (
    <div className="dashboard-container">
      <h2>Welcome to Your Dashboard</h2>
      {subscription === null ? (
        <ChoosePlan user={user} />
      ) : (
        <div className="subscription-card">
          <h3>Subscription Status</h3>
          <p>📦 Plan: <strong>{subscription}</strong></p>
          <p>📈 Leads used this month: {leadsUsed}</p>
          <button className="upgrade-btn">Upgrade Plan</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
