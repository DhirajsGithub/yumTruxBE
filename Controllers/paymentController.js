require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createPaymentIntents = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount, // should be an integer if you want $ 15.90 then it should be like 1590
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return res.json({ paymentIntent: paymentIntent.client_secret });
  } catch (e) {
    return res.status(400).json({
      error: e.message,
    });
  }
};

const createConnectAccount = async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
    });
    return res.send(account);
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

const createConnectAccountLink = async (req, res) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: "acct_1NIp2u2R1Mv5frxK", // destination or let say truck owner destination
      refresh_url: "https://example.com/reauth",
      return_url: "https://example.com/return",
      type: "account_onboarding",
    });
    return res.send(accountLink);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const createPaymentSheet = async (req, res) => {
  const amount = req.body.amount;
  const paymentId = req.body.paymentId;
  try {
    // Use an existing Customer ID if this is a returning customer.
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-11-15" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // $10.99
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      application_fee_amount: 123, // will be store as collection fee for each transaction
      transfer_data: {
        destination: paymentId, // destination
      },
    });

    return res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    return res.send(error);
  }
};
const checkBalance = async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: "acct_1NHmBwE7FFm6fD4o",
    });
    return res.send(balance);
  } catch (error) {
    return res.send(error);
  }
};

module.exports = {
  createPaymentIntents,
  createConnectAccount,
  createConnectAccountLink,
  createPaymentSheet,
  checkBalance,
};
