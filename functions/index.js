const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendLeadEmail = functions.https.onCall(async (data, context) => {
  const {
    officerEmail,
    officerName,
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
  } = data;

  const msg = {
    to: officerEmail,
    from: functions.config().sendgrid.from,
    subject: "New Mortgage Lead Assigned",
    text: `Lead Info:
Name: ${name}
Email: ${email}
Phone: ${phone}
Loan Type: ${loanType}
Loan Amount: ${loanAmount}
Credit Score: ${creditScore}
ZIP: ${zip}
Property Type: ${propertyType}
Occupancy: ${occupancy}
First Time Buyer: ${homeBuyerType}
Assigned To: ${officerName}`,
  };

  await sgMail.send(msg);
  return {success: true};
});
