const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

// Stripe webhook endpoint
app.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.customer_email; 
    const subscriptionName = session.metadata.plan;

    // Connect to Firebase Admin SDK here and update Firestore:
    const { getFirestore, doc, updateDoc } = require("firebase-admin/firestore");
    const admin = require("firebase-admin");

    if (!admin.apps.length) {
      admin.initializeApp();
    }

    const db = getFirestore();

    // Update loan officer record
    const qSnap = await db.collection("loanOfficers").where("email", "==", email).get();
    qSnap.forEach(async (docRef) => {
      await updateDoc(doc(db, "loanOfficers", docRef.id), {
        subscription: subscriptionName,
        leadsSentThisMonth: 0,
        lastPayment: new Date().toISOString(),
      });
    });

    console.log(`Subscription updated for: ${email}`);
  }

  res.status(200).json({ received: true });
});

// Start server
app.listen(5000, () => console.log("Stripe webhook server running on port 5000"));
