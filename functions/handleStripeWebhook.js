const functions = require("firebase-functions");
const Stripe = require("stripe");
const admin = require("./initAdmin");
const stripe = new Stripe(functions.config().stripe.secret_key);
const endpointSecret = functions.config().stripe.webhook_secret;

// No Express, direct function export
exports.handleStripeWebhook = functions
  .runWith({ timeoutSeconds: 30 })
  .https.onRequest((req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      console.error("⚠️ Invalid signature:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle session completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const firebaseUID = session.metadata?.firebaseUID;

      if (firebaseUID) {
        admin.firestore().collection("loanOfficers").doc(firebaseUID).set(
          {
            subscription: session.subscription,
            subscriptionType:
              session.display_items?.[0]?.plan?.nickname?.toLowerCase() || "unknown",
            leadsSentThisMonth: 0,
          },
          { merge: true }
        );
      }
    }

    res.status(200).json({ received: true });
  });