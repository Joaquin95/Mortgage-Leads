const functions          = require("firebase-functions");
const { sendLeadToOfficer } = require("./sendLeadToOfficer");
const { handlePayPalOrder  } = require("./handlePayPalOrder");
const { sendLeadEmail      } = require("./sendLeadEmail");
const sgMail             = require("@sendgrid/mail");
const admin              = require("./initAdmin");


sgMail.setApiKey(functions.config().sendgrid.key);


exports.sendLeadToOfficer     = sendLeadToOfficer;
exports.handlePayPalOrder     = handlePayPalOrder;
exports.sendLeadEmail         = sendLeadEmail;



exports.sendOfficerWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const doc = await admin.firestore().collection("loanOfficers").doc(user.uid).get();
  const nmls = doc.data()?.nmls || "Not provided";

  const msg = {
    to: user.email,
    from: "Texasmortgagelead@gmail.com", 
    subject: "Welcome to TexasMortgageLeads — Let's Get You Verified",
    html: `
      <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
        <h2 style="color: #2563eb;">Welcome to TexasMortgageLead.com 🎉</h2>
        <p>Thanks for signing up! Your dashboard is live and ready.</p>
        <p>We'll now verify your NMLS number (${nmls}). This usually takes less than 24 hours.</p>
        <p>Once verified, you'll receive lead access instantly.</p>
        <br />
        <p>Questions? Contact us at <strong>Texasmortgagelead@gmail.com</strong></p>
        <hr />
        <p style="font-size: 14px;">TexasMortgageLeads.com | Verified Loan Officer Network</p>
      </div>
    `,
  };

  return sgMail.send(msg);
});
