import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../services/firebase";
import { useAuth } from "../services/useAuth";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("YOUR_PUBLIC_STRIPE_KEY");

const ChoosePlan = () => {
  const { currentUser } = useAuth();

  const handleSubscribe = async (subscriptionType) => {
    try {
      const functions = getFunctions(app);
      const createCheckoutSession = httpsCallable(
        functions,
        "createCheckoutSession"
      );

      const result = await createCheckoutSession({
        email: currentUser.email,
        subscriptionType,
      });

      const sessionId = result.data.id;

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error("Stripe checkout error:", err.message);
      alert("Something went wrong! Please try again.");
    }
  };
  
  return (
    <div className="plan-options">
      <h3>Choose a Plan</h3>
      <p>Select a plan to start receiving Texas mortgage leads.</p>

      <button
        onClick={() => handleSubscribe("starter")}
        className="plan-button green"
      >
        Starter (5 Leads)
      </button>
      <button
        onClick={() => handleSubscribe("pro")}
        className="plan-button blue"
      >
        Pro (10 Leads)
      </button>
      <button
        onClick={() => handleSubscribe("elite")}
        className="plan-button purple"
      >
        Elite (20 Leads)
      </button>
    </div>
  );
};

export default ChoosePlan;
