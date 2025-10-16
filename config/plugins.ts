const nodemailer = require("nodemailer");
import path from "path";

export default ({ env }) => ({
  'users-permissions': {
    enabled: true,
    config: {
      jwt: {
        expiresIn: '7d',
      },
      providers: {
      local: {
        enabled: true, // ⚠️ dòng này rất quan trọng!
      },
      },
    },
  },
 email: {
    config: {
      provider: path.resolve(
        process.cwd(),
        "src/extensions/email/providers/custom-provider.js" // ⚠️ Chỉ cần file .js nằm ở src, không cần build
      ),
      providerOptions: {
        host: env("SMTP_HOST", "smtp.gmail.com"),
        port: env.int("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
      },
      settings: {
        defaultFrom: env("SMTP_FROM", "your_email@gmail.com"),
        defaultReplyTo: env("SMTP_REPLY_TO", "your_email@gmail.com"),
      },
    },
  },
});
