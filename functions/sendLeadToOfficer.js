// functions/sendLeadToOfficer.js

const functions = require("firebase-functions");
const admin     = require("./initAdmin");
const sgMail    = require("@sendgrid/mail");

sgMail.setApiKey(functions.config().sendgrid.api_key);

// Define your plan quotas and number of shards
const QUOTA        = { Basic: 3, Standard: 6, Premium: 10 };
const TOTAL_SHARDS = 10;

exports.sendLeadToOfficer = functions.https.onCall(
  async (leadData, context) => {
    // 1. Destructure incoming lead data (with sane defaults)
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
      utmSource  = "direct",
      utmMedium  = "none",
      utmCampaign= "none",
    } = leadData;

    const fallbackEmail = "mintinvestments95@gmail.com";

    try {
      // 2. Pick a random shard (0 through TOTAL_SHARDS-1)
      const shard = Math.floor(Math.random() * TOTAL_SHARDS);

      // 3. Query only officers in that shard
      const officersSnap = await admin.firestore()
        .collection("loanOfficers")
        .where("shardId", "==", shard)
        .get();

      // 4. Filter out officers who have no active subscription or are over quota
      const eligible = officersSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(officer => {
          const maxLeads = QUOTA[officer.subscriptionType] || 0;
          return officer.subscriptionType
            && officer.leadsSentThisMonth < maxLeads;
        });

      // 5. Sort by weighted usage: least percent-of-quota used first
      eligible.sort((a, b) => {
        const aPct = a.leadsSentThisMonth / QUOTA[a.subscriptionType];
        const bPct = b.leadsSentThisMonth / QUOTA[b.subscriptionType];
        return aPct - bPct;
      });

      // 6. Select the top officer or fallback to admin
      const selected = eligible.length
        ? eligible[0]
        : { id: null, email: fallbackEmail };

      // 7. Build the email to the officer
      const officerMsg = {
        to: selected.email,
        from: { email: "noreply@texasmortgagelead.com", name: "Texas Mortgage Leads" },
        replyTo: "texasmortgagelead@gmail.com",
        subject: "New Mortgage Lead Submitted 📩",
        html: `
<h2>New Lead Assigned</h2>
<ul>
  <li><strong>Name:</strong> ${name}</li>
  <li><strong>Email:</strong> ${email}</li>
  <li><strong>Phone:</strong> ${phone}</li>
  <li><strong>City:</strong> ${city}</li>
  <li><strong>Loan Type:</strong> ${loanType}</li>
  <li><strong>Loan Amount:</strong> ${loanAmount}</li>
  <li><strong>ZIP:</strong> ${zip}</li>
  <li><strong>Credit Score:</strong> ${creditScore}</li>
  <li><strong>Property Type:</strong> ${propertyType}</li>
  <li><strong>Occupancy:</strong> ${occupancy}</li>
  <li><strong>First-time Homebuyer?:</strong> ${homeBuyerType}</li>
</ul>
<p>🔗 Routed to: <strong>${selected.email}</strong></p>
<p style="background:#007BFF;color:#fff;padding:10px;border-radius:5px;display:inline-block;">
  🔑 Login to your dashboard to follow up with this lead.
</p>
        `,
      };

      // 8. Build the thank-you email to the client
      const clientMsg = {
        to: email,
        from: { email: "noreply@texasmortgagelead.com", name: "Texas Mortgage Leads" },
        replyTo: "noreply@texasmortgagelead.com",
        subject: "Thanks for your mortgage quote request!",
        text: "A licensed loan officer will be in touch shortly.",
        html: `
<p>Hi ${name},</p>
<p>Thank you for requesting a mortgage quote! A licensed officer will contact you soon.</p>
<ul>
  <li>✅ Review by a licensed professional</li>
  <li>📞 Call or email within the hour</li>
  <li>💬 Questions welcome any time</li>
</ul>
<p>— The Texas Mortgage Lead Team</p>
        `,
      };

      // 9. Send both emails
      await sgMail.send(officerMsg);
      await sgMail.send(clientMsg);

      // 10. Record the lead in Firestore
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
        utmSource,
        utmMedium,
        utmCampaign,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 11. If an officer was assigned (not fallback), increment their quota usage
      if (selected.id) {
        const officerRef = admin.firestore().collection("loanOfficers").doc(selected.id);
        await officerRef.update({
          leadsSentThisMonth: admin.firestore.FieldValue.increment(1),
        });

        // 12. Optionally send a near-quota alert when at 90% usage
        const updatedSnap = await officerRef.get();
        const updated    = updatedSnap.data();
        const maxLeads   = QUOTA[updated.subscriptionType] || 0;
        const used       = updated.leadsSentThisMonth;

        if (used >= maxLeads - 1) {
          const alertMsg = {
            to: selected.email,
            from: { email: "noreply@texasmortgagelead.com", name: "Texas Mortgage Leads" },
            replyTo: "texasmortgagelead@gmail.com",
            subject: "🚨 You’re nearly at your lead limit!",
            html: `
<p>Hello,</p>
<p>You have used <strong>${used}</strong> of your <strong>${maxLeads}</strong> monthly leads.</p>
<p>After you hit your limit, new leads will be paused.</p>
<p>
  <a href="https://www.texasmortgagelead.com/login"
     style="background:#007BFF;color:#fff;padding:10px;border-radius:5px;text-decoration:none;">
    Upgrade your plan now
  </a>
</p>
            `,
          };
          await sgMail.send(alertMsg);
        }
      }

      // 13. Return success and the email routed to
      return { success: true, routedTo: selected.email };
    } catch (error) {
      console.error("🔥 sendLeadToOfficer error:", error);
      throw new functions.https.HttpsError("internal", "Failed to route lead.");
    }
  }
);