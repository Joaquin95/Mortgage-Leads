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
    subject: `📩 New Lead Assigned: ${name}`,
    html:
    "<div style=\"font-family: Arial, sans-serif; padding: 20px; " +
  "background-color: #f5f9fc; border-radius: 10px; border: 1px solid #ddd; " +
  "max-width: 600px; margin: auto;\">" +
  "<img src=\"https://i.imgur.com/dm7X6XG.png\" alt=\"Texas Mortgage Leads\" " +
  "style=\"max-width: 200px; margin-bottom: 20px;\" />" +
  "<h2 style=\"color: #2c3e50;\">New Lead Assigned to You, " + officerName +
  "!</h2>" +
  "<p><strong>Name:</strong> " + name + "</p>" +
  "<p><strong>Email:</strong> " + email + "</p>" +
  "<p><strong>Phone:</strong> " + phone + "</p>" +
  "<p><strong>Loan Type:</strong> " + loanType + "</p>" +
  "<p><strong>Loan Amount:</strong> " + loanAmount + "</p>" +
  "<p><strong>ZIP Code:</strong> " + zip + "</p>" +
  "<p><strong>Credit Score:</strong> " +
    (creditScore || "Not Provided") + "</p>" +
  "<p><strong>Property Type:</strong> " + propertyType + "</p>" +
  "<p><strong>Occupancy:</strong> " + occupancy + "</p>" +
  "<p><strong>First-Time Buyer:</strong> " + homeBuyerType + "</p>" +
  "<p style=\"margin-top: 20px;\">💼 Please follow up with this lead ASAP.</p>" +
  "<hr style=\"margin: 20px 0;\" />" +
  "<p style=\"font-size: 12px; color: #999;\">This lead was delivered by " +
  "TexasMortgageLeads.com</p>" +
  "</div>",
    text: `New lead assigned to ${officerName}

Name: ${name}
Email: ${email}
Phone: ${phone}
Loan Type: ${loanType}
Loan Amount: ${loanAmount}
ZIP: ${zip}
Credit Score: ${creditScore}
Property Type: ${propertyType}
Occupancy: ${occupancy}
First-Time Buyer: ${homeBuyerType}`,
  };

  await sgMail.send(msg);
  return {success: true};
});
