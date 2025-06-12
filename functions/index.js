const admin = require("firebase-admin");

admin.initializeApp();

// Import and export all cloud functions
const { createCheckoutSession } = require("./createCheckoutSession");
const { sendLeadEmail } = require("./sendLeadEmail");
const { handleStripeWebhook } = require("./webhook");

exports.createCheckoutSession = createCheckoutSession;
exports.sendLeadEmail = sendLeadEmail;
exports.handleStripeWebhook = handleStripeWebhook;
