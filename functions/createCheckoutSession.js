const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const stripe = require("stripe")(functions.config().stripe.secret);

exports.createCheckoutSession = onRequest({ region: "us-central1" }, async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { email, plan } = req.body;

  const prices = {
    starter: "price_1RUa8hFmfJpxrjsaf7d37wWg",
    pro: "price_1RUa9JFmfJpxrjsauIwG2p8k",
    elite: "price_1RUa9lFmfJpxrjsapCiRe3s8",
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: prices[plan], quantity: 1 }],
      success_url: "https://mortgage-leads.vercel.app/dashboard?success=true",
      cancel_url: "https://mortgage-leads.vercel.app/dashboard?cancelled=true",
      customer_email: email,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});
