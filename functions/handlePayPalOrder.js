const functions = require("firebase-functions");
const admin = require("./initAdmin");

exports.handlePayPalOrder = functions.https.onCall(async (data, context) => {
  const { orderID, email, subscriptionType } = data;
  const auth = context.auth;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be logged in"
    );
  }

  const userId = auth.uid;
  const planType = subscriptionType;
  const quotaMap = { basic: 3, standard: 6, premium: 10 };
  const monthlyQuota = quotaMap[planType.toLowerCase()] || 0;
  console.log(
    "💵 handlePayPalOrder firing for user:",
    userId,
    "plan:",
    planType,
    "quota:",
    monthlyQuota
  );

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
