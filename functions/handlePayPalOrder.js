const functions = require("firebase-functions");
const admin = require("./initAdmin");
const axios = require("axios");
const express = require("express");
const app = express();
app.use(express.json());

async function getPayPalAccessToken() {
  const clientID = functions.config().paypal.client_id;
  const secret = functions.config().paypal.secret;

  const response = await axios({
    method: "post",
    url: "https://api-m.paypal.com/v1/oauth2/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    auth: {
      username: clientID,
      password: secret,
    },
    data: "grant_type=client_credentials",
  });

  return response.data.access_token;
}

async function verifyPayPalOrder(orderID) {
  const accessToken = await getPayPalAccessToken();
  const response = await axios.get(
    `https://api-m.paypal.com/v2/checkout/orders/${orderID}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.status === "COMPLETED";
}

exports.handlePayPalOrder = functions.https.onCall(async (data, context) => {
  const { orderID, email, subscriptionType } = data;
  const auth = context.auth;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be logged in"
    );
  }

  const isVerified = await verifyPayPalOrder(orderID);
  if (!isVerified) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Payment not completed"
    );
  }

  const quotaMap = { basic: 3, standard: 6, premium: 10 };
  const planTypeRaw = subscriptionType;
  const planType =
    planTypeRaw.charAt(0).toUpperCase() + planTypeRaw.slice(1).toLowerCase();
  const monthlyQuota = quotaMap[planTypeRaw.toLowerCase()];

  await admin.firestore().collection("loanOfficers").doc(auth.uid).set(
    {
      email,
      subscriptionType: planType,
      monthlyQuota,
      leadsSentThisMonth: 0,
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentProvider: "PayPal",
      orderID,
    },
    { merge: true }
  );

  return { status: "success" };
});

app.post("/webhook", async (req, res) => {
  const event = req.body;

  if (event.event_type === "CHECKOUT.ORDER.COMPLETED") {
    const transaction = {
      orderID: event.resource.id,
      payerEmail: event.resource.payer.email_address,
      amount: event.resource.purchase_units[0].amount.value,
      currency: event.resource.purchase_units[0].amount.currency_code,
      timestamp: new Date().toISOString(),
    };

    await admin.firestore().collection("transactions").add(transaction);
    console.log("✅ Transaction stored:", transaction);
    res.status(200).send("Stored");
  } else {
    res.status(200).send("Ignored");
  }
});

exports.webhookServer = functions.https.onRequest(app);
