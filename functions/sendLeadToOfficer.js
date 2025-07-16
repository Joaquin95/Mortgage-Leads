const functions = require("firebase-functions");
const admin = require("./initAdmin");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(functions.config().sendgrid.api_key);

exports.sendLeadToOfficer = functions.https.onCall(
  async (leadData, context) => {
    const {
      name,
      email,
      phone,
      city,
      loanType,
      zip,
      creditScore,
      loanAmount,
      propertyType,
      occupancy,
      homeBuyerType,
    } = leadData;

    const fallbackEmail = "mintinvestments95@gmail.com";
    const quota = {
      Basic: 3,
      Standard: 6,
      Premium: 10,
    };

    try {
      const snap = await admin.firestore().collection("loanOfficers").get();

      const eligible = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((o) => {
          const maxLeads = quota[o.subscriptionType] || 0;
          return (
            o.subscriptionType !== "unknown" && o.leadsSentThisMonth < maxLeads
          );
        });

      const selected = eligible.length
        ? eligible.sort(
            (a, b) => a.leadsSentThisMonth - b.leadsSentThisMonth
          )[0]
        : { id: null, email: fallbackEmail };

      const msg = {
        to: selected.email,
        from: {
          email: "noreply@texasmortgagelead.com",
          name: "Texas Mortgage Leads",
        },
        replyTo: "texasmortgagelead@gmail.com",

        subject: "New Mortgage Lead",
        html: `
<h2>New Lead</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>City:</strong> ${city}</p>     
<p><strong>Loan Type:</strong> ${loanType}</p>
<p><strong>Loan Amount:</strong> ${loanAmount}</p>
<p><strong>ZIP:</strong> ${zip}</p>
<p><strong>Credit Score:</strong> ${creditScore}</p>
<p><strong>Property Type:</strong> ${propertyType}</p>
<p><strong>Occupancy:</strong> ${occupancy}</p>
<p><strong>Home Buyer Type:</strong> ${homeBuyerType}</p>
<p>📌 Routed to: ${selected.email}</p>
<p>📌 Sent by TexasMortgageLeads.com</p>
      `,
      };

      await sgMail.send(msg);

      await admin.firestore().collection("leads").add({
        name,
        email,
        phone,
        city,
        loanType,
        zip,
        creditScore,
        loanAmount,
        propertyType,
        occupancy,
        homeBuyerType,
        officerEmail: selected.email,
        status: "New",
        notes: "",
        tasks: [],

        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (selected.id) {
        await admin
          .firestore()
          .collection("loanOfficers")
          .doc(selected.id)
          .update({
            leadsSentThisMonth: admin.firestore.FieldValue.increment(1),
          });
      }

      return { success: true, routedTo: selected.email };
    } catch (err) {
      console.error("🔥 Lead dispatch error:", err.message);
      throw new functions.https.HttpsError("internal", "Failed to route lead.");
    }
  }
);
