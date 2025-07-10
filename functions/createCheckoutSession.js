const { onCall } = require("firebase-functions/v2/https");
const admin = require("./initAdmin");
const Stripe = require("stripe");
const { defineSecret } = require("firebase-functions/params");

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const PRICE_BASIC = defineSecret("PRICE_BASIC");
const PRICE_STANDARD = defineSecret("PRICE_STANDARD");
const PRICE_PREMIUM = defineSecret("PRICE_PREMIUM");

exports.createCheckoutSession = onCall(
  {
    secrets: [STRIPE_SECRET_KEY, PRICE_BASIC, PRICE_STANDARD, PRICE_PREMIUM],
  },
  async (req) => {
    const { email, subscriptionType } = req.data;
    const auth = req.auth;

    console.log("Incoming data:", req.data);
    console.log("Auth:", auth);

    if (!auth) {
      throw new Error("Unauthenticated: User must be logged in.");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    const priceMap = {
      basic: PRICE_BASIC.value(),
      standard: PRICE_STANDARD.value(),
      premium: PRICE_PREMIUM.value(),
    };

    const priceId = priceMap[subscriptionType];

    console.log("Subscription Type:", subscriptionType);
    console.log("Resolved Price ID:", priceId);

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