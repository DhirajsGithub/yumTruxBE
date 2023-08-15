const express = require("express");
const {
  createPaymentIntents,
  createConnectAccount,
  createConnectAccountLink,
  createPaymentSheet,
  checkBalance,
  generatePaypalAccessToken,
  generatePaypalSignupLink,
  createPaypalOrder,
  capturePaypalPayment,
  truckOwnerPayment,
} = require("../Controllers/paymentController");
const router = express.Router();

// /payments
router.post("/intents", createPaymentIntents);

// flow of below api's are important, they are dependent on each other
// stripe payment flow
router.post("/createConnectAccount", createConnectAccount);

router.post("/createConnectAccountLink", createConnectAccountLink);

router.post("/createPaymentSheet", createPaymentSheet);

router.post("/checkBalance", checkBalance);

// paypal payment flow
// /payments/generatePaypalAccessToken  --> this api will return access token in return which will be used in next api calls
router.get("/generatePaypalAccessToken", generatePaypalAccessToken);

// /payments/generatePaypalSignupLink  --> pass the access token you get from above api call as bearerToken : "access_token"
// it will return signup link for seller take the linke which has rel:action_url
router.post("/generatePaypalSignupLink", generatePaypalSignupLink);

// user onboarding for paypal payment
router.post("/createPaypalOrder", createPaypalOrder);

// truck owner payment
router.post("/truckOwnerPayment", truckOwnerPayment);

module.exports = router;
