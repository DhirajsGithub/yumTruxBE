const express = require("express");
const {
  createPaymentIntents,
  createConnectAccount,
  createConnectAccountLink,
  createPaymentSheet,
  checkBalance,
} = require("../Controllers/paymentController");
const router = express.Router();

router.post("/intents", createPaymentIntents);

// flow of below api's are important, they are dependent on each other
router.post("/createConnectAccount", createConnectAccount);

router.post("/createConnectAccountLink", createConnectAccountLink);

router.post("/createPaymentSheet", createPaymentSheet);

router.post("/checkBalance", checkBalance);

module.exports = router;
