const nodemailer = require("nodemailer");
require("dotenv").config();

const ActionMail = async (email, subject, title, discription) => {
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
    html: `<!DOCTYPE html>

<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
    }
    .email-container {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 5px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .description {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .action {
      font-size: 18px;
      color: #007bff;
    }
    .admin-info {
      font-size: 14px;
      margin-top: 10px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <p class="title">Important Update: Account Security Enhancement</p>
    <p class="description">Hello [User's Name],</p>
    <p>We want to inform you about an action that has been taken regarding your account on our app.</p>
    <p class="action">Action Taken: Enhanced Account Security Measures</p>
    <p>Your account security is our top priority. In light of recent events, we have implemented additional security measures to safeguard your account and personal information.</p>
    <p>If you have any concerns or questions about this action, please feel free to contact our support team.</p>
    <p>Thank you for being a valued user of our app.</p>
    <p class="admin-info">Sincerely,</p>
    <p class="admin-info">yumtrux Administration</p>
    <div class="admin-info">
      <img src="https://img.archiexpo.com/pt/images_ae/photo-g/167318-16413478.jpg" alt="yumtrux Administration" width="100">
    </div>
  </div>
</body>
</html>

    `,
  });

  return info;
};

module.exports = { ActionMail };
