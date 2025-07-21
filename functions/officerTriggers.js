const functions = require("firebase-functions");
const admin = require("./initAdmin");
const TOTAL_SHARDS = 10;

exports.onOfficerCreate = functions.auth.user().onCreate(async (user) => {
  console.log("🔥 onOfficerCreate fired for uid:", user.uid);

  return admin
    .firestore()
    .collection("loanOfficers")
    .doc(user.uid)
    .set({ shardTest: true });
});
