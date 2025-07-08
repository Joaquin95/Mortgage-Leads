const functions = require("firebase-functions/v1");
const stripe = require("stripe")(functions.config().stripe.secret);

exports.createCheckoutSession = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
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
