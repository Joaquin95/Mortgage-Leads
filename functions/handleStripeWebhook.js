const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);

const endpointSecret = functions.config().stripe.webhook_secret;

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.handleStripeWebhook = onRequest({ region: "us-central1", rawRequest: true }, async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const planMap = {
      "price_1RUa8hFmfJpxrjsaf7d37wWg": "starter",
      "price_1RUa9JFmfJpxrjsauIwG2p8k": "pro",
      "price_1RUa9lFmfJpxrjsapCiRe3s8": "elite",
    };

    try {
      const priceId = session?.items?.data?.[0]?.price?.id;
      const plan = planMap[priceId] || "starter";
      const email = session.customer_email;

      const snapshot = await admin
        .firestore()
        .collection("loanOfficers")
        .where("email", "==", email)
        .get();

      snapshot.forEach((doc) => {
        doc.ref.update({
          subscription: plan,
          leadsSentThisMonth: 0,
        });
      });

      console.log(`✅ Updated subscription for ${email} to ${plan}`);
    } catch (err) {
      console.error("❌ Error updating Firestore:", err.message);
      return res.status(500).send("Internal Server Error");
    }
  }

  res.status(200).send("✅ Webhook received");
});
