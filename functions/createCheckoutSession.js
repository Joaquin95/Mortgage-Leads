const functions = require("firebase-functions");
const admin = require("./initAdmin");
const Stripe = require("stripe");

const stripe = new Stripe(functions.config().stripe.secret_key);

exports.createCheckoutSession = functions
  .runWith({ timeoutSeconds: 60 }) 
  .https.onCall(async (data, context) => {
    const { email, subscriptionType } = data;
    const auth = context.auth;

    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in."
      );
    }

    const priceMap = {
      basic: functions.config().stripe.price_basic,
      standard: functions.config().stripe.price_standard,
      premium: functions.config().stripe.price_premium,
    };

    const priceId = priceMap[subscriptionType];

    if (!priceId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid subscription type."
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://texasmortgagelead.com/dashboard?success=true",
      cancel_url: "https://texasmortgagelead.com/dashboard?cancelled=true",
      metadata: { firebaseUID: auth.uid },
    });

    return { id: session.id };
  });
