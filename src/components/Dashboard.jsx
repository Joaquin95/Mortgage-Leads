import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ChoosePlan from "./ChoosePlan";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [leadsUsed, setLeadsUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const docRef = doc(db, "loanOfficers", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSubscription(data.subscription);
          setLeadsUsed(data.leadsSentThisMonth);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>Please log in.</p>;

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
