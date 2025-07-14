const functions = require("firebase-functions");
const express = require("express");
const Stripe = require("stripe");
const admin = require("./initAdmin");

const stripe = new Stripe(functions.config().stripe.secret_key);
const endpointSecret = functions.config().stripe.webhook_secret;

const app = express();
app.use(express.raw({ type: "application/json" }));

app.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️ Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const firebaseUID = session.metadata?.firebaseUID;

    if (firebaseUID) {
      const subscription = session.subscription;
      const subscriptionType =
        session.display_items?.[0]?.plan?.nickname?.toLowerCase() || "unknown";

      await admin.firestore().collection("loanOfficers").doc(firebaseUID).set(
        {
          subscription,
          subscriptionType,
          leadsSentThisMonth: 0,
        },
        { merge: true }
      );
    }
  }

  res.status(200).json({ received: true });
});

exports.handleStripeWebhook = functions
  .runWith({ timeoutSeconds: 30 })
  .https.onRequest(app);
