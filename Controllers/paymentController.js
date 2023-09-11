require("dotenv").config();
const fetch = require("node-fetch");
const base64 = require("base-64");
const adminModel = require("../Models/Admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const uniqid = require("uniqid");

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
    partner_config_override: {
      partner_logo_url:
        "https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg",
      return_url: "https://stripe.com/docs/api/authentication",
      return_url_description:
        "the url to return the merchant after the paypal onboarding process.",
      action_renewal_url: "https://testenterprises.com/renew-exprired-url",
      show_add_credit_card: true,
    },
  });

  try {
    let signUpData = await fetch(paypalUrl, {
      method: "POST",
      headers: headers,
      body: body,
    });
    signUpData = await signUpData.json();
    return res.status(200).send(signUpData);
  } catch (error) {
    return res.status(400).send(error);
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
          // will be store as collection fee for each transaction
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

// truck owener payment

// /payments/truckOwnerPayment
const truckOwnerPayment = async (req, res) => {
  const truckId = req.query.truckId; // Extract the truckId from the query parameters
  // const truckId = "64fcbc34d30426c5c0112c8a";
  console.log(truckId);

  try {
    let priceIds = await adminModel.find({}).select("MonthlyPriceData");
    priceIds = priceIds[0]?.MonthlyPriceData;
    if (priceIds?.length > 0) {
      const priceId = priceIds[priceIds?.length - 1]?.priceId;
      const YOUR_DOMAIN =
        "https://stripe.com/docs/checkout/quickstart?client=react";
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://localhost:3000/truck-owner/pay?success=true`, // CHANGE TO yumtrux.com
        cancel_url: `http://localhost:3000/truck-owner/pay?canceled=true`, // CHANGE TO yumtrux.com
        client_reference_id: truckId,
      });

      res.redirect(303, session.url);
    } else {
      return res.status(500).json({
        message: "No priceIds found contact admin",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(400).json({});
  }
};
// we added a product in stripe dashboard and then we created a price id for that product to put in truckOwnerPayment controller

// yumtrux monthly payment handle by admin
// /payments/createNewProduct
const createNewProduct = async (req, res) => {
  const adminSecret = req.user.adminSecret;
  const id = uniqid();
  const { name, description, price } = req.body;
  const adminId = req.user.adminId;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  try {
    const product = await stripe.products.create({
      name: name,
      images: [
        "https://res.cloudinary.com/dk8hyxr2z/image/upload/v1693335141/yumtrux_categories/icon_qzowsb.png",
      ],
      description: description,
      default_price_data: {
        unit_amount: price, // make sure to convert the price in cents
        currency: "usd",
      },
      expand: ["default_price"],
    });
    try {
      const findAdmin = await adminModel
        .findByIdAndUpdate(
          { _id: adminId },
          {
            $push: {
              MonthlyPriceData: {
                name: product.name,
                description: product.description,
                imgUrl: product.images[0],
                addedOn: new Date(),
                price: product.default_price.unit_amount,
                productId: product.id,
                priceId: product.default_price.id,
                currency: product.default_price.currency,
                type: product.default_price.type,
              },
            },
          }
        )
        .then((admin) => {
          return res.status(201).send({
            message: "Successfully updated the MonthlyPriceData",
            status: "success",
          });
        })
        .catch((err) => {
          return res.status(400).send({
            message: "Couldn't find the admin",
            status: "error",
          });
        });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message, status: "error" });
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
  truckOwnerPayment,
  createNewProduct,
};
