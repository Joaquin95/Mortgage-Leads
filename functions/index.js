const functions = require("firebase-functions");
const { sendLeadEmail } = require("./sendLeadEmail");
const { sendLeadToOfficer } = require("./sendLeadToOfficer");
const sgMail = require("@sendgrid/mail");
const admin = require("./initAdmin");
const { handlePayPalOrder } = require("./handlePayPalOrder");

sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendLeadToOfficer = sendLeadToOfficer;
exports.sendLeadEmail = sendLeadEmail;
exports.handlePayPalOrder = handlePayPalOrder;

exports.sendOfficerWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const officerDoc = await admin.firestore().collection("loanOfficers").doc(user.uid).get();
  const nmls = officerDoc.data()?.nmls || "Not provided";

  const msg = {
    to: user.email,
    from: "mintinvestments95@gmail.com", 
    subject: "Welcome to TexasMortgageLeads — Let's Get You Verified",
    html: `
      <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
        <h2 style="color: #2563eb;">Welcome to TexasMortgageLeads.com 🎉</h2>
        <p>Thanks for signing up! Your dashboard is live and ready.</p>
        <p>We'll now verify your NMLS number (${nmls}). This usually takes less than 24 hours.</p>
        <p>Once verified, you'll receive lead access instantly.</p>
        <br />
        <p>Questions? Contact us at <strong>mintinvestments95@gmail.com</strong></p>
        <hr />
        <p style="font-size: 14px;">TexasMortgageLeads.com | Verified Loan Officer Network</p>
      </div>
    `,
  };

  return sgMail.send(msg);
});
