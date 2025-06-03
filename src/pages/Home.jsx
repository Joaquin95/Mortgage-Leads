import React from "react";
import { Link } from "react-router-dom";

const Home = () => (
  <div className="text-center p-8">
    <h1 className="text-4xl font-bold mb-4">Find the Best Mortgage Rates in Texas 🏡</h1>
    <p className="mb-6">Submit your info. We connect you with a licensed loan officer based on your needs.</p>
    <Link to="/leadform">
      <button>Get My Free Quote</button>
    </Link>

    {/* Example Future Sections */}
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-2">How It Works</h2>
      <p>We route leads to licensed loan officers subscribed to our network. Your data is secure.</p>
    </div>

    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-semibold mb-2">Why Choose Us</h2>
      <p>✅ Fast Matching | ✅ Licensed Pros | ✅ No Obligation</p>
    </div>
  </div>
);

export default Home;
