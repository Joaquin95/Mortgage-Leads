const functions    = require("firebase-functions");
const admin        = require("./initAdmin");
const TOTAL_SHARDS = 10;

exports.onOfficerCreate = functions
  .auth
  .user()
  .onCreate(async (user) => {
    console.log("New officer signup:", user.uid);
    return admin
      .firestore()
      .collection("loanOfficers")
      .doc(user.uid)
      .set({ shardTest: true });
  });