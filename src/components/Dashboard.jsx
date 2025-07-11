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
    // Ensure user stays logged in for 1hr+
    setPersistence(auth, browserLocalPersistence).catch((err) =>
      console.error("Persistence error:", err)
    );

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Show admin panel if admin email
        if (
          firebaseUser.email &&
          firebaseUser.email.toLowerCase() === "mintinvestments95@gmail.com"
        ) {
          setLoading(false);
          return;
        }

        // Live update loan officer data
        const docRef = doc(db, "loanOfficers", firebaseUser.uid);
        const unsubSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSubscription(data.subscription);
            setLeadsUsed(data.leadsSentThisMonth || 0);
          }
          setLoading(false);
        });

        // Clean up Firestore listener
        return () => unsubSnapshot();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in.</p>;

  // Admin route
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
