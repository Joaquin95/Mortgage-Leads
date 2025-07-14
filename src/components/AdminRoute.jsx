import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthed(user);
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (checking) return <p className="text-white p-4">⏳ Checking session...</p>;
  if (authed?.email !== "Mintinvestments95@gmail.com") return <Navigate to="/" />;
  return children;
};

export default AdminRoute;