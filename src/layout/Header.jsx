import { Link } from "react-router-dom";
import { useAuth } from "../services/useAuth";
import { useState } from "react";

const Header = () => {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <Link to="/" className="logo" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}>
        <img src="/TML2025.png" alt="Texas Mortgage Leads Logo" style={{ height: "40px" }} />
        <span>Texas Mortgage Leads</span>
      </Link>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <nav className={`nav ${menuOpen ? "open" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/leadform">Get Quote</Link>
        <Link to="/login">Login</Link>
        <Link to="/officer-leads">Loan Officer Leads</Link>
        {currentUser?.email === "Mintinvestments95@gmail.com" && (
          <Link to="/admin">Admin</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;