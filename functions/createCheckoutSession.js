const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret_key);

admin.initializeApp();

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  const { email, subscriptionType } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const priceId = functions.config().stripe[subscriptionType];

  if (!priceId) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid subscription type.");
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
      firebaseUID: context.auth.uid,
    },
  });

  return {
    id: session.id,
  };
});
