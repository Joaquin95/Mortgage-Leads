import React from 'react';
import { Link } from 'react-router-dom';
import Leadform from '../components/LeadForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation/Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">Texas Mortgage Leads</h1>
        <nav className="space-x-4">
          <Link className="text-gray-700 hover:text-blue-600" to="/officer-login">Loan Officer Login</Link>
          <Link className="text-gray-700 hover:text-blue-600" to="/officer-signup">Register</Link>
        </nav>
      </header>

      {/* Hero / Lead Form */}
      <main className="p-6 max-w-5xl mx-auto">
        {/* <h2 className="text-2xl font-semibold mb-4">Request a Mortgage Quote</h2> */}
        {/* Insert your Mortgage Form Component Here */}
        <Leadform />
      </main>

      {/* Footer */}
      <footer className="bg-white text-center p-4 shadow-inner mt-10">
        <p className="text-sm text-gray-500">© 2025 MortgageMatch. All rights reserved.</p>
      </footer>
    </div>
  );
}
