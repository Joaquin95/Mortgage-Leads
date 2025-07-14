import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
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
  if (!authed) return <Navigate to="/login" />;
  return children;
};

export default ProtectedRoute;