import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
  <header className="bg-white shadow p-4 flex justify-between items-center">
    <div className="text-xl font-bold">🏠 Texas Mortgage Leads</div>
    <nav className="space-x-4">
      <Link to="/">Home</Link>
      <Link to="/leadform">Get a Quote</Link>
      <Link to="/signup">Signup</Link>
      <Link to="/login">Login</Link>
      <Link to="/admin">Admin</Link>
    </nav>
  </header>
);

export default Header;
