const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");

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
    html: `<div style="font-family: Arial; padding: 20px;">
      <h2>New Lead for ${officerName}</h2>
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
    </div>`,
    text: `New lead assigned to ${officerName}`,
  };


  await sgMail.send(msg);
  return { success: true };
});
