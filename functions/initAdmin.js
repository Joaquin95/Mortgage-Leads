const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

module.exports = admin;
// This module initializes Firebase Admin SDK and exports the admin instance