const functions = require("firebase-functions");
const express = require("express");

const app = express();
app.use(express.raw({ type: 'application/json' }));

const { createCheckoutSession } = require("./createCheckoutSession");
const { handleStripeWebhook } = require("./handleStripeWebhook");
const { sendLeadEmail } = require("./sendLeadEmail");

exports.createCheckoutSession = createCheckoutSession;
exports.sendLeadEmail = sendLeadEmail;

exports.handleStripeWebhook = functions.https.onRequest(app.post("/webhook", handleStripeWebhook));
