const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");

exports.sendLeadEmail = functions.https.onCall(async (data, context) => {
  const apiKey = functions.config().sendgrid.api_key;
  const fromEmail = functions.config().sendgrid.from_email;

  if (!apiKey || !fromEmail) {
    console.error("Missing SendGrid API key or from_email config.");
    throw new functions.https.HttpsError("internal", "SendGrid config missing.");
  }

  sgMail.setApiKey(apiKey);

  const {
    name = "",
    email = "",
    phone = "",
    loanType = "",
    zip = "",
    creditScore = "",
    loanAmount = "",
    propertyType = "",
    occupancy = "",
    homeBuyerType = "",
    officerEmail = "",
  } = data || {};

  if (!officerEmail) {
    throw new functions.https.HttpsError("invalid-argument", "Missing officer email.");
  }

  const msg = {
    to: officerEmail,
    from: fromEmail,
    subject: "New Mortgage Lead",
    html: `
<h2>New Lead Information</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Loan Type:</strong> ${loanType}</p>
<p><strong>Loan Amount:</strong> ${loanAmount}</p>
<p><strong>ZIP:</strong> ${zip}</p>
<p><strong>Credit Score:</strong> ${creditScore}</p>
<p><strong>Property Type:</strong> ${propertyType}</p>
<p><strong>Occupancy:</strong> ${occupancy}</p>
<p><strong>First-Time Buyer:</strong> ${homeBuyerType}</p>
<p>📌 Sent by TexasMortgageLeads.com</p>
    `,
  };

  await sgMail.send(msg);
  return { success: true };
});