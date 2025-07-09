const functions = require("firebase-functions");
const sgMail = require("@sendGrid/mail");

// ✅ Basic helloWorld test route
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello World - Gen 1 function running on Node 20");
});

// ✅ sendLeadEmail Cloud Function (Gen 1 HTTPS Callable)
exports.sendLeadEmail = functions.https.onCall(async (data, context) => {
  // ✅ Load SendGrid API key INSIDE the function
  const apiKey = functions.config().sendGrid.api_key;
  const fromEmail = functions.config().sendGrid.from_email;

  if (!apiKey || !fromEmail) {
    console.error("Missing SendGrid config.");
    throw new functions.https.HttpsError("internal", "SendGrid configuration missing.");
  }

  sgMail.setApiKey(apiKey);

  const {
    name,
    email,
    phone,
    loanType,
    zip,
    creditScore,
    loanAmount,
    propertyType,
    occupancy,
    homeBuyerType,
    officerEmail,
  } = data;

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

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    throw new functions.https.HttpsError("internal", "Email failed to send.");
  }
});
