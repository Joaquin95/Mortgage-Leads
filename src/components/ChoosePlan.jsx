import React, { useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../services/firebase";
import { useAuth } from "../services/useAuth";
import ReactGA from "react-ga4";

const ChoosePlan = () => {
  const { currentUser } = useAuth();
  const functions = getFunctions(app);
  const handlePayPalOrder = httpsCallable(functions, "handlePayPalOrder");

  const loadPayPalScript = () => {
    if (window.paypal) return;
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"; 
    script.async = true;
    document.body.appendChild(script);
  };

  useEffect(() => {
    loadPayPalScript();
  }, []);

  const handleSubscribe = async (plan) => {
    if (!currentUser) {
      alert("Please log in to subscribe.");
      return;
    }

    const priceMap = {
      basic: "29.99",
      standard: "59.99",
      premium: "99.99",
    };

    ReactGA.event({
      category: "Subscription",
      action: "Clicked Plan",
      label: plan,
      value: parseFloat(priceMap[plan]),
    });

    if (!window.paypal) {
      alert("PayPal script not loaded.");
      return;
    }

    window.paypal
      .Buttons({
        createOrder: (data, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: priceMap[plan] } }],
          }),
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          console.log("✅ Approved:", order);

          try {
            await handlePayPalOrder({
              orderID: order.id,
              email: currentUser.email,
              subscriptionType: plan,
            });
            alert(`Subscription activated: ${plan} plan`);
          } catch (err) {
            console.error("🔥 Firebase error:", err);
            alert("Error storing subscription.");
          }
        },
        onError: (err) => {
          console.error("💥 PayPal error:", err);
          alert("Payment failed. Try again.");
        },
      })
      .render(`#paypal-button-container`);
  };

  return (
    <div className="plan-options p-6 bg-slate-700 rounded-lg shadow-lg text-white">
      <h3 className="text-2xl font-semibold mb-4">Choose Your Plan</h3>
      <p className="mb-6">
        Select a plan below to start receiving high-intent Texas mortgage leads.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleSubscribe("basic")}
          className="plan-button green px-4 py-3 rounded-lg"
        >
          Basic Plan (3 Leads $29.99)
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
