const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

// Initialize Stripe inside the function scope, using process.env for secret
// Stripe client must be created inside the exported function to guarantee env var availability

exports.handleStripeWebhook = onRequest(
  { secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
  async (req, res) => {
    // Create Stripe instance here
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const uid = session.metadata.firebaseUID;
      const customerEmail = session.customer_email;

      let subscriptionAmount = 5;
      if (session.amount_total === 1000) subscriptionAmount = 10;
      else if (session.amount_total === 2000) subscriptionAmount = 20;

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
        res.json({ received: true });
      } catch (err) {
        console.error("Firestore update error:", err);
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.json({ received: true });
    }
  }
);
