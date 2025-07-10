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

    const stripe = new Stripe(req.rawRequest.env.STRIPE_SECRET_KEY);
    const priceMap = {
      basic: req.rawRequest.env.PRICE_BASIC,
      standard: req.rawRequest.env.PRICE_STANDARD,
      premium: req.rawRequest.env.PRICE_PREMIUM,
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
      success_url: "https://texasmortgagelead.com/dashboard?success=true",
      cancel_url: "https://texasmortgagelead.com/dashboard?cancelled=true",
      metadata: {
        firebaseUID: auth.uid,
      },
    });

    return {
      id: session.id,
    };
  }
);
