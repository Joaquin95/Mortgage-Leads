const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

exports.createCheckoutSession = onCall(
  { secrets: ["STRIPE_SECRET_KEY"] },
  async (req) => {
    const { email, subscriptionType } = req.data;
    const auth = req.auth;

    if (!auth) {
      throw new Error("Unauthenticated: User must be logged in.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Map subscriptionType to Stripe price IDs (replace these with your actual secret values or use `functions.config().stripe[...]` if you've set them that way)
    const priceMap = {
      basic: "price_123", // Replace with your actual Stripe price ID
      standard: "price_456",
      premium: "price_789",
    };

    const priceId = priceMap[subscriptionType];

    if (!priceId) {
      throw new Error("Invalid subscription type.");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "https://mortgage-leads.vercel.app/dashboard?success=true",
      cancel_url: "https://mortgage-leads.vercel.app/dashboard?cancelled=true",
      metadata: {
        firebaseUID: auth.uid,
      },
    });

    return {
      id: session.id,
    };
  }
);
