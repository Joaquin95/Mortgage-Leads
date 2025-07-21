const functions = require("firebase-functions");
const admin = require("./initAdmin");

exports.handlePayPalOrder = functions.https.onCall(async (data, context) => {
  const { orderID, email, subscriptionType } = data;
  const auth = context.auth;

  if (!auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const quotaMap = {
    basic: 3,
    standard: 6,
    premium: 10,
  };

  const monthlyQuota = quotaMap[subscriptionType.toLowerCase()] || 0;

  await admin.firestore().collection("loanOfficers").doc(auth.uid).set(
    {
      email,
      subscriptionType,
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