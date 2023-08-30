const nodemailer = require("nodemailer");
require("dotenv").config();

const ActionMail = async (email, subject, title, discription, links) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_MAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: "borseganesh123@gmail.com",
    to: email,
    subject: subject,
    text: "Hello world",
    html: `<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Truck Status Update</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          width: 80%;
          margin: 20px auto;
          background-color: #f2f2f2;
          font-family: "Arial", sans-serif;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          border-radius: 16px;
        }
        .logo {
          text-align: center;
        }
        .logo img {
          max-width: 100px;
          height: auto;
        }
        .message {
          padding: 20px;
        }
        .contact-link {
          text-align: center;
          margin-top: 20px;
        }
        .contact-link a {
          color: #007bff;
          text-decoration: none;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #333333;
          text-align: center;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img
            src="http://res.cloudinary.com/dk8hyxr2z/image/upload/v1693335141/yumtrux_categories/icon_qzowsb.png"
            alt="Food Truck Logo"
          />
        </div>
        <div class="company-name">YumTrux</div>
        <div class="message">
          <p>Dear User,</p>
          <p style="font-size: larger">
            ${title}
          </p>
          <p style="font-size: larger"> <strong>Reason:</strong>  ${discription}</p>
          <p>
            If you have any questions or need further assistance, please feel free
            to <a href=${links.link1}>contact the admin</a>.
          </p>
        </div>
        <div class="contact-link">
          <p>Best regards,</p>
          <p>The Food Truck Support Team</p>
          <p><a href=${links.link2}>Contact Us</a></p>
        </div>
      </div>
    </body>
  </html>`,
  });

  return info;
};

module.exports = { ActionMail };
