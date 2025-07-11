const functions = require("firebase-functions");
const admin = require("./initAdmin");
const Stripe = require("stripe");

const stripe = new Stripe(functions.config().stripe.secret_key);
const endpointSecret = functions.config().stripe.webhook_secret;

exports.handleStripeWebhook = functions.https.onRequest(
  {
    timeoutSeconds: 30,
    cors: false,
    // Required: Disables automatic body parsing so rawBody is available
    rawBody: true,
  },
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = functions.config().stripe.webhook_secret;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      console.error("❌ Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const uid = session.metadata.firebaseUID;
      const customerEmail = session.customer_email;

      let subscriptionAmount = 5;
      if (session.amount_total === 2999) subscriptionAmount = 10;
      else if (session.amount_total === 4999) subscriptionAmount = 20;
      else if (session.amount_total === 1999) subscriptionAmount = 5;

      try {
        await admin.firestore().collection("loanOfficers").doc(uid).set(
          {
            email: customerEmail,
            subscription: subscriptionAmount,
            leadsSentThisMonth: 0,
            subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        console.log("✅ Subscription updated for:", customerEmail);
        return res.json({ received: true });
      } catch (err) {
        console.error("❌ Firestore update error:", err);
        return res.status(500).send("Internal Server Error");
      }
    }

    return res.json({ received: true });
  }
);
