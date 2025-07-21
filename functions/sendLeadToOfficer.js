const functions = require("firebase-functions");
const admin = require("./initAdmin");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(functions.config().sendgrid.api_key);


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
     
      const shard = Math.floor(Math.random() * TOTAL_SHARDS);
      console.log(`🔍 Chosen shard: ${shard}`);

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
          shardIdType: typeof d.data().shardId,
        }))
      );

      
      const eligible = snap.docs
        .map((d) => {
          const data = d.data();
         
          if (typeof data.shardId === "string") {
            data.shardId = parseInt(data.shardId, 10);
          }
          return { id: d.id, ...data };
        })
        .filter((o) => {
          const maxLeads = QUOTA[o.subscriptionType] || 0;
          const ok = o.subscriptionType && o.leadsSentThisMonth < maxLeads;
          console.log(
            `   ➤ Checking ${o.email}:`,
            `type=${o.subscriptionType}`,
            `used=${o.leadsSentThisMonth}/${maxLeads}`,
            `→ ${ok}`
          );
          return ok;
        });

      console.log(
        `✅ Eligible after filter:`,
        eligible.map((o) => o.email)
      );

      
      eligible.sort((a, b) => {
        const aPct = a.leadsSentThisMonth / QUOTA[a.subscriptionType];
        const bPct = b.leadsSentThisMonth / QUOTA[b.subscriptionType];
        return aPct - bPct;
      });

      const selected = eligible.length
        ? eligible[0]
        : { id: null, email: fallbackEmail };

      console.log(`🎯 Selected candidate: ${selected.email}`);

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
  <li><strong>Amount:</strong> ${loanAmount}</li>
  <li><strong>ZIP:</strong> ${zip}</li>
  <li><strong>Credit Score:</strong> ${creditScore}</li>
  <li><strong>Property Type:</strong> ${propertyType}</li>
  <li><strong>Occupancy:</strong> ${occupancy}</li>
  <li><strong>First-time Buyer?:</strong> ${homeBuyerType}</li>
</ul>
<p>🔗 Routed to: <strong>${selected.email}</strong></p>
      `,
      };

      
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

        const updated = (await ref.get()).data();
        const maxLeads = QUOTA[updated.subscriptionType] || 0;
        if (updated.leadsSentThisMonth >= maxLeads - 1) {
          await sgMail.send({
            to: selected.email,
            from: {
              email: "noreply@texasmortgagelead.com",
              name: "Texas Mortgage Leads",
            },
            replyTo: "texasmortgagelead@gmail.com",
            subject: "🚨 You’re nearly at your lead limit!",
            html: `<p>You’ve used ${updated.leadsSentThisMonth}/${maxLeads} leads. Upgrade soon!</p>`,
          });
        }
      }

      console.log("✅ sendLeadToOfficer completed successfully.");
      return { success: true, routedTo: selected.email };
    } catch (error) {
      console.error("🔥 sendLeadToOfficer error:", error.message);
      console.error(error.stack);
      throw new functions.https.HttpsError("internal", "Failed to route lead.");
    }
  }
);
