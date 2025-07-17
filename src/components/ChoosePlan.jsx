import React from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../services/firebase";
import { useAuth } from "../services/useAuth";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51RUFe3FmfJpxrjsao8Ke0fu4lLUSlH6EJkdrurlD1wU8DQpy1O7WRrBOpuZnQHcRp7D24oDDKCtaKSIyx6pmpIdL00Z0iuOBEG"
);

const ChoosePlan = () => {
  const { currentUser } = useAuth();
  const functions = getFunctions(app, "us-central1");
  const createCheckoutSession = httpsCallable(
    functions,
    "createCheckoutSession"
  );

  const handleSubscribe = async (subscriptionType) => {
    if (!currentUser) {
      alert("Please log in to subscribe.");
      return;
    }

    try {
      const { data } = await createCheckoutSession({
        email: currentUser.email,
        subscriptionType, // "basic" | "standard" | "premium"
      });

      const sessionId = data.id;
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe.js failed to load.");

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error("Stripe redirect error:", error);
        alert(error.message);
      }
    } catch (err) {
      console.error("Subscription error:", err);
      alert(err.message || "Failed to start checkout. Please try again.");
    }
  };

  return (
    <div className="plan-options p-6 bg-slate-700 rounded-lg shadow-lg text-white">
      <h3 className="text-2xl font-semibold mb-4">Choose Your Plan</h3>
      <p className="mb-6">
        Select a plan below to start receiving high-intent Texas mortgage
        leads.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleSubscribe("basic")}
          className="plan-button green px-4 py-3 rounded-lg"
        >
          Basic Plan (3 Leads  $29.99)
        </button>
        <button
          onClick={() => handleSubscribe("standard")}
          className="plan-button blue px-4 py-3 rounded-lg"
        >
          Standard Plan (6 Leads $59.99)
        </button>
        <button
          onClick={() => handleSubscribe("premium")}
          className="plan-button purple px-4 py-3 rounded-lg"
        >
          Premium Plan (10 Leads $99.99)
        </button>
      </div>
    </div>
  );
};

export default ChoosePlan;