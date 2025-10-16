"use strict";
const nodemailer = require("nodemailer");

module.exports = {
  init(providerOptions = {}, settings = {}) {
    const transporter = nodemailer.createTransport({
      host: providerOptions.host,
      port: providerOptions.port,
      secure: false,
      auth: {
        user: providerOptions.auth.user,
        pass: providerOptions.auth.pass,
      },
    });

    return {
      async send(options) {
        const { to, from, subject, text, html } = options;
        await transporter.sendMail({
          from: from || settings.defaultFrom,
          to,
          subject,
          text,
          html,
        });
      },
    };
  },
};
