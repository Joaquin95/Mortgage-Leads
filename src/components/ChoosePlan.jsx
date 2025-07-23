import React, { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../services/firebase";
import { useAuth } from "../services/useAuth";
import ReactGA from "react-ga4";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const priceMap = {
  basic: "29.99",
  standard: "59.99",
  premium: "99.99",
};

const QUOTA = {
  basic: 3,
  standard: 6,
  premium: 10,
};

export default function ChoosePlan({ mandatory = false }) {
  const { currentUser } = useAuth();
  const functions = getFunctions(app);
  const handlePayPalOrder = httpsCallable(functions, "handlePayPalOrder");
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleApprove = async (plan, order) => {
    try {
      await handlePayPalOrder({
        orderID: order.id,
        email: currentUser.email,
        subscriptionType: plan,
      });
      alert(`Subscription activated: ${plan} plan`);
      setShowModal(false);
    } catch (err) {
      console.error("🔥 Firebase error:", err);
      alert("Error storing subscription.");
    }
  };

  const renderButtons = (plan) => (
    <PayPalButtons
      style={{ layout: "vertical", label: "subscribe" }}
      createOrder={(data, actions) =>
        actions.order.create({
          purchase_units: [{ amount: { value: priceMap[plan] } }],
        })
      }
      onApprove={(data, actions) =>
        actions.order.capture().then((order) => handleApprove(plan, order))
      }
      onError={(err) => {
        console.error("💥 PayPal error:", err);
        alert("Payment failed. Try again.");
      }}
    />
  );

  return (
    <PayPalScriptProvider options={{ "client-id": clientId, currency: "USD" }}>
      <div className="plan-options p-4 bg-slate-600 rounded-lg shadow-lg text-white">
        <h3 className="text-2xl font-semibold mb-4">Choose Your Plan</h3>
        <p className="mb-6">
          Select a plan below to start receiving high-intent Texas mortgage
          leads.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["basic", "standard", "premium"].map((plan) => (
            <div key={plan} className="flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  if (!currentUser)
                    return alert("Please log in to subscribe.");
                  ReactGA.event({
                    category: "Subscription",
                    action: "Clicked Plan",
                    label: plan,
                    value: parseFloat(priceMap[plan]),
                  });
                  setSelectedPlan(plan);
                  setShowModal(true);
                }}
                className={`plan-button ${
                  plan === "basic"
                    ? "green"
                    : plan === "standard"
                    ? "blue"
                    : "purple"
                } px-4 py-3 rounded-lg`}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan (
                {QUOTA[plan]} Leads – ${priceMap[plan]})
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg text-gray-800">
            <h4 className="text-xl font-semibold mb-2">
              Subscribe to the{" "}
              <span className="capitalize">{selectedPlan}</span> Plan
            </h4>
            <p className="mb-4">
              You selected the{" "}
              <span className="font-medium capitalize">{selectedPlan}</span> plan – $
              {priceMap[selectedPlan]}. Click below to complete your subscription.
            </p>
            <div className="w-full">{renderButtons(selectedPlan)}</div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}
    </PayPalScriptProvider>
  );
}