import { Link } from "react-router-dom";
import { useAuth } from "../services/useAuth";
import { useState } from "react";

const Header = () => {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      {/* <div className="header-center"> */}
        <Link
          to="/"
        >
          <img
            src="/TML20252.png"
            alt="Texas Mortgage Leads Logo"
            style={{ height: "200px" }}
          />
          {/* <span>Texas Mortgage Leads</span> */}
        </Link>
      {/* </div> */}

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
