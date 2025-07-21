import React, { useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../services/firebase";
import { useAuth } from "../services/useAuth";
import ReactGA from "react-ga4";

const ChoosePlan = () => {
  const { currentUser } = useAuth();
  const functions = getFunctions(app);
  const handlePayPalOrder = httpsCallable(functions, "handlePayPalOrder");

   useEffect(() => {
    if (!currentUser) return;

    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD";
    script.async = true;
    script.onload = () => {
      const priceMap = {
        basic: "29.99",
        standard: "59.99",
        premium: "99.99",
      };

      ["basic", "standard", "premium"].forEach((plan) => {
        if (document.getElementById(`paypal-button-${plan}`)?.hasChildNodes()) return;

        window.paypal
          .Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [{ amount: { value: priceMap[plan] } }],
              });
            },
            onApprove: async (data, actions) => {
              const order = await actions.order.capture();
              console.log("✅ PayPal order approved:", order);

              ReactGA.event({
                category: "Subscription",
                action: "Purchased via PayPal",
                label: plan,
                value: parseFloat(priceMap[plan]),
              });

              try {
                await handlePayPalOrder({
                  orderID: order.id,
                  email: currentUser.email,
                  subscriptionType: plan,
                });
                alert(`Subscription activated: ${plan} plan`);
              } catch (err) {
                console.error("🔥 Firebase update failed:", err);
                alert("Something went wrong storing your subscription.");
              }
            },
            onError: (err) => {
              console.error("💥 PayPal error:", err);
              alert("Payment failed. Please try again.");
            },
          })
          .render(`#paypal-button-${plan}`);
      });
    };
    document.body.appendChild(script);
  }, [currentUser]);


  return (
    <div className="plan-options p-6 bg-slate-700 rounded-lg shadow-lg text-white">
      <h3 className="text-2xl font-semibold mb-4">Choose Your Plan</h3>
      <p className="mb-6">
        Select a plan below to start receiving high-intent Texas mortgage leads.
      </p>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="plan-button green px-4 py-3 rounded-lg">
    <h4 className="text-lg font-bold mb-2">Basic Plan</h4>
    <p>3 Leads — $29.99</p>
    <div id="paypal-button-basic"></div>
  </div>

  <div className="plan-button blue px-4 py-3 rounded-lg">
    <h4 className="text-lg font-bold mb-2">Standard Plan</h4>
    <p>6 Leads — $59.99</p>
    <div id="paypal-button-standard"></div>
  </div>

  <div className="plan-button purple px-4 py-3 rounded-lg">
    <h4 className="text-lg font-bold mb-2">Premium Plan</h4>
    <p>10 Leads — $99.99</p>
    <div id="paypal-button-premium"></div>
  </div>
</div>
</div>
  );
};

export default ChoosePlan;
