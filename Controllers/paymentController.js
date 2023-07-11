require("dotenv").config();
const base64 = require("base-64");
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
    return error.message;
  }
};

const createConnectAccountLink = async (req, res) => {
  const paymentId = req.body.paymentId;
  const returnUrl = req.body.returnUrl;
  const refreshUrl = req.body.refreshUrl;
  if (paymentId?.length > 0) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: paymentId, // destination or let say truck owner destination
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      });
      return res.status(201).send(accountLink);
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    return res.status(400).send("paymentId is required");
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
      application_fee_amount: 0, // will be store as collection fee for each transaction
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
  const paymentId = req.body.paymentId;
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: paymentId,
    });
    return res.send(balance);
  } catch (error) {
    return res.send(error);
  }
};

// paypal payment flow

// /payments/generatePaypalAccessToken
const generatePaypalAccessToken = async (req, res) => {
  const paypalUrl = "https://api-m.sandbox.paypal.com/v1/oauth2/token";
  const headers = {
    Accept: "application/json",
    "Accept-Language": "en_US",
    // Authorization:
    //   "Basic " +
    //   Buffer.from(
    //     `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET_KEY}`
    //   ).toString("base64"),
    Authorization:
      "Basic " +
      base64.encode(
        process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET_KEY
      ),
    "Content-Type": "application/x-www-form-urlencoded",
  };
  console.log(
    "Basic " +
      base64.encode(
        process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET_KEY
      )
  );
  const body = "grant_type=client_credentials";
  try {
    let token = await fetch(paypalUrl, {
      method: "POST",
      headers: headers,
      body: body,
    });
    token = await token.json();
    return res.status(200).send(token);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

// /payments/generatePaypalSignupLink
const generatePaypalSignupLink = async (req, res) => {
  let bearerToken = req.body.bearerToken;

  const paypalUrl =
    "https://api-m.sandbox.paypal.com/v2/customer/partner-referrals";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${bearerToken}`,
  };
  const body = JSON.stringify({
    tracking_id: "TRACKING-ID",
    operations: [
      {
        operation: "API_INTEGRATION",
        api_integration_preference: {
          rest_api_integration: {
            integration_method: "PAYPAL",
            integration_type: "THIRD_PARTY",
            third_party_details: {
              features: ["PAYMENT", "REFUND"],
            },
          },
        },
      },
    ],
    products: ["EXPRESS_CHECKOUT"],
    legal_consents: [
      {
        type: "SHARE_DATA_CONSENT",
        granted: true,
      },
    ],
  });

  try {
    let signUpData = await fetch(paypalUrl, {
      method: "POST",
      headers: headers,
      body: body,
    });
    signUpData = await signUpData.json();
    return res.send(signUpData);
  } catch (error) {
    return res.send(error);
  }
};

const capturePaypalPayment = async () => {
  try {
    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/3H160699JR890330G/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer A21AAJ58RLhgLBw4N2obAjkWUMa_lbE2VZXR6s9ZjumRcCPiAI9Qru4s7qigpc6kr1OzjFb52QSNyC77ri32mWwDYib-5TeBw",
        },
      }
    );
    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// /payments/createPaypalOrder
const createPaypalOrder = async (req, res) => {
  const bearerToken = req.body.bearerToken;
  const amount = req.body.amount;
  const sellerPaypalEmail = req.body.sellerPaypalEmail;
  const orderUrl = "https://api-m.sandbox.paypal.com/v2/checkout/orders";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + bearerToken,
  };

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount,
        },
        payee: {
          email_address: sellerPaypalEmail,
        },
        payment_instruction: {
          disbursement_mode: "INSTANT",
          platform_fees: [
            {
              amount: {
                currency_code: "USD",
                value: "00.00",
              },
            },
          ],
        },
      },
    ],
  };
  if (
    bearerToken?.length > 0 &&
    String(amount)?.length > 0 &&
    sellerPaypalEmail?.length > 0
  ) {
    try {
      await capturePaypalPayment();
      let response = await fetch(orderUrl, {
        headers,
        method: "POST",
        body: JSON.stringify(body),
      });
      response = await response.json();
      return res.status(201).send(response);
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    return res
      .status(401)
      .send("Please provide bearer token, amount and seller paypal email");
  }
};

module.exports = {
  createPaymentIntents,
  createConnectAccount,
  createConnectAccountLink,
  createPaymentSheet,
  checkBalance,
  generatePaypalAccessToken,
  generatePaypalSignupLink,
  createPaypalOrder,
  capturePaypalPayment,
};
