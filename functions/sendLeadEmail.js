const functions = require("firebase-functions/v1"); // ✅ Ensure v1 to use .region()
const sgMail = require("@sendgrid/mail");

exports.sendLeadEmail = functions
  .region("us-central1")
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB",
    secrets: ["SENDGRID_API_KEY", "SENDGRID_FROM_EMAIL"],
  })
  .https.onCall(async (data, context) => {
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

    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: officerEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
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
    } catch (error) {
      console.error("SendGrid error:", error);
      throw new functions.https.HttpsError("internal", "Email failed to send.");
    }
  });
