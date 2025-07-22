const functions = require("firebase-functions");
const admin = require("./initAdmin");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(functions.config().sendgrid.api_key);

const QUOTA = { Basic: 3, Standard: 6, Premium: 10 };
const FALLBACK_EMAIL = "mintinvestments95@gmail.com";

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

    try {
      const snap = await admin.firestore().collection("loanOfficers").get();
      console.log(`📂 Total officers: ${snap.size}`);

      const officers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const eligible = officers.filter((o) => {
        const plan = o.subscriptionType;
        const max = QUOTA[plan] || 0;
        const ok = !!plan && o.leadsSentThisMonth < max;
        console.log(
          `   ➤ ${o.email} → plan=${plan}, used=${o.leadsSentThisMonth}/${max} → ${ok}`
        );
        return ok;
      });

      console.log(`✅ Eligible count: ${eligible.length}`);

      eligible.sort((a, b) => a.leadsSentThisMonth - b.leadsSentThisMonth);

      const selected = eligible.length
        ? eligible[0]
        : { id: null, email: FALLBACK_EMAIL };

      console.log(`🎯 Routing to: ${selected.email}`);

      await sgMail.send({
        to: selected.email,
        from: {
          email: "noreply@texasmortgagelead.com",
          name: "Texas Mortgage Leads",
        },
        replyTo: "texasmortgagelead@gmail.com",
        subject: "New Mortgage Lead Submitted 📩",
        html: `
        <h2>New Lead</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Loan Type:</strong> ${loanType}</p>
        <p><strong>Loan Amount:</strong> ${loanAmount}</p>
        <p><strong>ZIP:</strong> ${zip}</p>
        <p><strong>Credit Score:</strong> ${creditScore}</p>
        <p><strong>Property Type:</strong> ${propertyType}</p>
        <p><strong>Occupancy:</strong> ${occupancy}</p>
        <p><strong>First-Time Buyer?:</strong> ${homeBuyerType}</p>
        <p>🔗 Routed to: <strong>${selected.email}</strong></p>
      `,
      });

      await sgMail.send({
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
<p>Thank you for your interest in a mortgage quote! A licensed loan officer will contact you shortly.</p>
<p>✅ A licensed Loan Officer will review your quote</p>
<p>📞 You’ll get a call or email within the hour</p>
<p>💬 Please ask questions </p>

<hr/>

<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${customerEmail}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>City:</strong> ${city}</p>
<p><strong>Loan Type:</strong> ${loanType}</p>
<p><strong>Loan Amount:</strong> ${loanAmount}</p>
<p><strong>ZIP:</strong> ${zip}</p>
<p><strong>Credit Score:</strong> ${creditScore}</p>
<p><strong>Property Type:</strong> ${propertyType}</p>
<p><strong>Occupancy:</strong> ${occupancy}</p>
<p><strong>First-time Homebuyer?:</strong> ${homeBuyerType}</p>

<br/>
<p><strong>The Texas Mortgage Lead Team</strong></p>
<p style="font-size: 13px; color: #666;">
  This message was sent from a monitored system. Need help? Just reply to this email.
</p>
      `,
      });

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
        tasks: [],
        utmSource,
        utmMedium,
        utmCampaign,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (selected.id) {
        const ref = admin
          .firestore()
          .collection("loanOfficers")
          .doc(selected.id);

        await ref.update({
          leadsSentThisMonth: admin.firestore.FieldValue.increment(1),
        });

        const updatedSnap = await ref.get();
        const updated = updatedSnap.data();
        const maxLeads = QUOTA[updated.subscriptionType] || 0;
        const used = updated.leadsSentThisMonth;

        console.log(
          `🔔 After increment: used=${used}/${maxLeads} for ${updated.subscriptionType}`
        );

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

      return { success: true, routedTo: selected.email };
    } catch (error) {
      console.error("🔥 sendLeadToOfficer error:", error);
      throw new functions.https.HttpsError("internal", "Routing failed");
    }
  }
);
