const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const admin = require("./initAdmin");

sgMail.setApiKey(functions.config().sendgrid.api_key);

exports.sendOfficerWelcomeEmail = functions.firestore
  .document("loanOfficers/{uid}")
  .onCreate(async (snap, ctx) => {
    const data = snap.data();
    const toEmail = data.email;
    const fullName = (data.firstName || "") + " " + (data.lastName || "");

    const msg = {
      to: toEmail,

      from: {
        email: "noreply@texasmortgagelead.com",
        name: "Texas Mortgage Leads",
      },
      subject: "Welcome to Texas Mortgage Leads!",
      html: `
    <h2>Welcome, ${fullName.trim() || "Loan Officer"}!</h2>

      <p>You're now part of a verified network of mortgage professionals.</p>
      <p>Start receiving high-intent leads and track your progress in your dashboard.</p>
      <p>📦 Plan: Your subscription is active.</p>
      <p>📈 Leads will begin flowing shortly.</p>
      <p>Thanks for joining us!</p>
    `,
    };

   try {
      await sgMail.send(msg);
      console.log("✅ Welcome email sent to", toEmail);
      return null;  
    } catch (err) {
      console.error("🔥 Welcome email failed:", err);
      return null; 
    }
  });

