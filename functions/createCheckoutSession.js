const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret_key);

admin.initializeApp();

exports.createCheckoutSession = functions.https.onCall(
  async (data, context) => {
    const { email, plan } = data;

    const prices = {
      starter: "price_1RUa8hFmfJpxrjsaf7d37wWg",
      pro: "price_1RUa9JFmfJpxrjsauIwG2p8k",
      elite: "price_1RUa9lFmfJpxrjsapCiRe3s8",
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: prices[plan],
          quantity: 1,
        },
      ],
      success_url: "https://mortgage-leads.vercel.app//dashboard?success=true",
      cancel_url: "https://mortgage-leads.vercel.app//dashboard?cancelled=true",
      customer_email: email,
    });

    return { url: session.url };
  }
);
