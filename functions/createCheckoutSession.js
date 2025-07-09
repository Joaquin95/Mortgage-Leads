const { onCall } = require("firebase-functions/v2/https");
const admin = require("./initAdmin");
const Stripe = require("stripe");

exports.createCheckoutSession = onCall(
  {
    secrets: [
      "STRIPE_SECRET_KEY",
      "PRICE_BASIC",
      "PRICE_STANDARD",
      "PRICE_PREMIUM",
    ],
  },
  async (req) => {
    const { email, subscriptionType } = req.data;
    const auth = req.auth;

    if (!auth) {
      throw new Error("Unauthenticated: User must be logged in.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const priceMap = {
      basic: process.env.PRICE_BASIC,
      standard: process.env.PRICE_STANDARD,
      premium: process.env.PRICE_PREMIUM,
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
