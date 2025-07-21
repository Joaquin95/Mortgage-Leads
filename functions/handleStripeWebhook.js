// const functions = require("firebase-functions");
// const admin = require("./initAdmin");





























// Stripe code below is commented out as it is not used in the current context
// exports.handleStripeWebhook = functions
//   .runWith({ timeoutSeconds: 30 })
//   .https.onRequest(async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
//     } catch (err) {
//       console.error("⚠️ Invalid Stripe signature:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const firebaseUID = session.metadata?.firebaseUID;
//       const subscription = session.subscription;

//       let subscriptionType = "unknown";

//       try {
//         const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
//         const item = lineItems?.data?.[0];
//         const priceId = item?.price?.id;

//         const priceMap = {
//           [functions.config().stripe.price_basic]: "Basic",
//           [functions.config().stripe.price_standard]: "Standard",
//           [functions.config().stripe.price_premium]: "Premium",
//         };

//         subscriptionType = priceMap[priceId] || "unknown";
//       } catch (err) {
//         console.error("⚠️ Stripe line item lookup failed:", err.message);
//       }


//       const quotaMap = {
//         Basic: 3,
//         Standard: 6,
//         Premium: 10,
//       };
//       const monthlyQuota = quotaMap[subscriptionType] || 0;

//       if (firebaseUID && subscription) {
//         try {
//           await admin.firestore().collection("loanOfficers").doc(firebaseUID).set(
//             {
//               email: session.customer_email,
//               subscription,
//               subscriptionType,
//               monthlyQuota,
//               leadsSentThisMonth: 0,
//               subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
//             },
//             { merge: true }
//           );
//           console.log(`✅ Subscription & quota stored for UID: ${firebaseUID}`);
//         } catch (err) {
//           console.error("🔥 Firestore update failed:", err.message);
//         }
//       }
//     }

//     res.status(200).json({ received: true });
//   });