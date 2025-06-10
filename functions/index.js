const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.pass,
  },
});

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

  const mailOptions = {
    from: functions.config().gmail.user,
    to: officerEmail,
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

  await transporter.sendMail(mailOptions);
  return {success: true}; // Return success response
});
