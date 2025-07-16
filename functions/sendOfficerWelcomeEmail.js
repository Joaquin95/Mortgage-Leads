const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(functions.config().sendgrid.api_key);

exports.sendOfficerWelcomeEmail = functions.https.onCall(async (data, context) => {
  const { email, name } = data;

  const msg = {
    to: email,
    from: {
      email: "noreply@texasmortgagelead.com",
      name: "Texas Mortgage Leads"
    },
    subject: "Welcome to Texas Mortgage Leads!",
    html: `
      <h2>Welcome, ${name || "Loan Officer"}!</h2>
      <p>You're now part of a verified network of mortgage professionals.</p>
      <p>Start receiving high-intent leads and track your progress in your dashboard.</p>
      <p>📦 Plan: Your subscription is active.</p>
      <p>📈 Leads will begin flowing shortly.</p>
      <p>Thanks for joining us!</p>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (err) {
    console.error("🔥 Welcome email failed:", err.message);
    throw new functions.https.HttpsError("internal", "Failed to send welcome email.");
  }
});