import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../services/firebase";
import { useAuth } from "../services/useAuth";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51RUFe3FmfJpxrjsao8Ke0fu4lLUSlH6EJkdrurlD1wU8DQpy1O7WRrBOpuZnQHcRp7D24oDDKCtaKSIyx6pmpIdL00Z0iuOBEG");

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
      window.open(`https://checkout.stripe.com/pay/${sessionId}`, "_blank");
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
        onClick={() => handleSubscribe("basic")}
        className="plan-button green"
      >
        Basic plan (5 Leads)
      </button>
      <button
        onClick={() => handleSubscribe("standard")}
        className="plan-button blue"
      >
        Standard plan (10 Leads)
      </button>
      <button
        onClick={() => handleSubscribe("premium")}
        className="plan-button purple"
      >
        Premium plan (20 Leads)
      </button>
    </div>
  );
};

export default ChoosePlan;
