const nodemailer = require("nodemailer");
require("dotenv").config();

const PasswordResetMail = async (email, passCode) => {
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
    subject: "YumTruks User Password Recover",
    text: "Hello world",
    html: `<html>

    <body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333333;">
    
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border: 1px solid #cccccc;">
        <h1 style="font-size: 24px; font-weight: bold; color: #333333; margin-top: 0;">Password Recovery</h1>
        <p>
          Dear User,
        </p>
        <p>
          You have requested a password recovery for your YumTrucks account.
        </p>
        <p>
          Please use the following recovery code to proceed:
        </p>
        <p>
          <strong style="display: inline-block; padding: 6px 12px; background-color: #e6e6e6; color: #333333; border: 1px solid #cccccc; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px;">${passCode}</strong>
        </p>
      </div>
    
    </body>
    
    </html>`,
  });

  return info;
};

module.exports = { PasswordResetMail };
