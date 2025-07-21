// functions/sendLeadToOfficer.js

const functions = require("firebase-functions");
const admin = require("./initAdmin");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(functions.config().sendgrid.api_key);

// Your plan quotas and number of shards
const QUOTA = { Basic: 3, Standard: 6, Premium: 10 };
const TOTAL_SHARDS = 10;

exports.sendLeadToOfficer = functions.https.onCall(
  async (leadData, context) => {
    const {
      name,
      email: customerEmail,
      phone,
      city,
      loanType,
      zip,
      creditScore,
      loanAmount,
      propertyType,
      occupancy,
      homeBuyerType,
      utmSource = "direct",
      utmMedium = "none",
      utmCampaign = "none",
    } = leadData;

    const fallbackEmail = "mintinvestments95@gmail.com";

    try {
      // 1) Pick a random shard
      const shard = Math.floor(Math.random() * TOTAL_SHARDS);
      console.log(`🔍 Chosen shard: ${shard}`);

      // 2) Query officers in that shard
      const snap = await admin
        .firestore()
        .collection("loanOfficers")
        .where("shardId", "==", shard)
        .get();
      console.log(
        `📂 Officers in shard (${snap.size}):`,
        snap.docs.map((d) => ({
          id: d.id,
          email: d.data().email,
          subscriptionType: d.data().subscriptionType,
        }))
      );

      // 3) Filter by active subscription & under quota
      const eligible = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((o) => {
          const maxLeads = QUOTA[o.subscriptionType] || 0;
          const ok = o.subscriptionType && o.leadsSentThisMonth < maxLeads;
          console.log(
            `   ➤ Checking ${o.email}: used ${o.leadsSentThisMonth}/${maxLeads} → ${ok}`
          );
          return ok;
        });
      console.log(
        `✅ Eligible after filter:`,
        eligible.map((o) => o.email)
      );

      // 4) Sort by percent-of-quota used (ascending)
      eligible.sort((a, b) => {
        const aPct = a.leadsSentThisMonth / QUOTA[a.subscriptionType];
        const bPct = b.leadsSentThisMonth / QUOTA[b.subscriptionType];
        return aPct - bPct;
      });
      console.log(
        `🎯 Selected candidate:`,
        eligible.length ? eligible[0].email : fallbackEmail
      );

      // 5) Final selection
      const selected = eligible.length
        ? eligible[0]
        : { id: null, email: fallbackEmail };

      // 6) Build and send email to the officer
      const officerMsg = {
        to: selected.email,
        from: {
          email: "noreply@texasmortgagelead.com",
          name: "Texas Mortgage Leads",
        },
        replyTo: "texasmortgagelead@gmail.com",
        subject: "New Mortgage Lead Submitted 📩",
        html: `
<h2>New Lead Assigned</h2>
<ul>
  <li><strong>Name:</strong> ${name}</li>
  <li><strong>Email:</strong> ${customerEmail}</li>
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

      // 7) Thank-you email to the customer
      const clientMsg = {
        to: customerEmail,
        from: {
          email: "noreply@texasmortgagelead.com",
          name: "Texas Mortgage Leads",
        },
        replyTo: "noreply@texasmortgagelead.com",
        subject: "Thanks for your mortgage quote request!",
        text: "A licensed loan officer will be in touch shortly.",
        html: `
<p>Hi ${name},</p>
      <p>Thank you for your interest in a mortgage quote! A licensed loan officer will contact you shortly.</p> <p>✅ A licensed Loan Officer will review your quote</p>
      <p>📞 You’ll get a call or email within the hour</p>
      <p>💬 You can ask questions or tweak your quote anytime</p>
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
<p><strong>First-time Homebuyer?:</strong> ${homeBuyerType}</p>
      <p><strong>The Texas Mortgage Lead Team</strong></p>
      <p style="font-size: 13px; color: #666;">This message was sent from a monitored system. Need help? Just reply to this email.</p>
    `,
      };

      await sgMail.send(officerMsg);
      await sgMail.send(clientMsg);

      // 8) Record the lead in Firestore
      await admin.firestore().collection("leads").add({
        name,
        email: customerEmail,
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

      // 9) Increment officer’s usage and send near-limit alert if needed
      if (selected.id) {
        const ref = admin
          .firestore()
          .collection("loanOfficers")
          .doc(selected.id);
        await ref.update({
          leadsSentThisMonth: admin.firestore.FieldValue.increment(1),
        });

        const updated = (await ref.get()).data();
        const maxLeads = QUOTA[updated.subscriptionType] || 0;
        const used = updated.leadsSentThisMonth;

        if (used >= maxLeads - 1) {
          const alertMsg = {
            to: selected.email,
            from: {
              email: "noreply@texasmortgagelead.com",
              name: "Texas Mortgage Leads",
            },
            replyTo: "texasmortgagelead@gmail.com",
            subject: "🚨 You’re nearly at your lead limit!",
            html: `
<p>Hi,</p>
<p>You’ve used <strong>${used}</strong> of your <strong>${maxLeads}</strong> monthly leads.</p>
<p>After you hit your limit, new leads will be paused.</p>
<p>
  <a href="https://www.texasmortgagelead.com/login"
     style="background:#007BFF;color:#fff;padding:10px;border-radius:5px;text-decoration:none;">
    Upgrade your plan now
  </a>
</p>
<p>Thanks for partnering with us!</p>
          `,
          };
          await sgMail.send(alertMsg);
        }
      }

      console.log("✅ sendLeadToOfficer completed successfully.");
      return { success: true, routedTo: selected.email };
    } catch (error) {
      console.error("🔥 sendLeadToOfficer error:", error);
      throw new functions.https.HttpsError("internal", "Failed to route lead.");
    }
  }
);
