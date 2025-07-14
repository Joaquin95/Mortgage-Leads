import { Link } from "react-router-dom";
import { useAuth } from "../services/useAuth";

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header className="header">
      <div className="logo">🏡 Texas Mortgage Leads</div>
      <nav>
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
