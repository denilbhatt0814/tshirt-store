const nodemailer = require("nodemailer");
const mailHelper = async (option) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_POST,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // mail message
  const message = {
    from: "denilbhatt2004@gmail.com", // sender address
    to: option.email,
    subject: option.subject, // Subject line
    text: option.message, // plain text bod
  };

  // send mail with defined transport object
  await transporter.sendMail(message);
};

module.exports = mailHelper;
