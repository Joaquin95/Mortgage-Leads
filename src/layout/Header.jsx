// components/Header.js
import { Link } from "react-router-dom";

const Header = () => (
  <header className="header">
    <div className="logo">🏡 Texas Mortgage Leads</div>
    <nav>
      <Link to="/">Home</Link>
      <Link to="/leadform">Get Quote</Link>
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
    </nav>
  </header>
);

export default Header;
