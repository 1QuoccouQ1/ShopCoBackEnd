"use strict";
const axios = require("axios");
const qs = require("qs");

export default {
  async subscribe(ctx) {
    try {
      const { email } = ctx.request.body;

      if (!email) {
        return ctx.badRequest("Email is required");
      }

      // 🔹 B1: Gửi email chào mừng ngay lập tức
      try {
        await strapi.service("api::newsletter.newsletter").sendWelcomeEmail(email);
      } catch (emailErr) {
        strapi.log.error("❌ Failed to send welcome email:", emailErr);
        // Không dừng quy trình – vẫn tiếp tục lưu email
      }

      // 🔹 B2: Kiểm tra xem email đã tồn tại trong DB chưa
      const existing = await strapi.db.query("api::newsletter.newsletter").findOne({
        where: { email },
      });

      // 🔹 B3: Nếu chưa có → Lưu vào DB
      let subscriber = existing;
      if (!existing) {
        subscriber = await strapi.db.query("api::newsletter.newsletter").create({
          data: {
            email,
          },
        });
        strapi.log.info(`✅ New subscriber saved: ${email}`);
      } else {
        strapi.log.info(`ℹ️ Email already exists in DB: ${email}`);
      }

      // 🔹 B4: Phản hồi về client
      return ctx.send({
        success: true,
        message: "Welcome email sent successfully!",
        data: subscriber,
      });

    } catch (error) {
      strapi.log.error("Newsletter subscribe failed:", error);
      return ctx.internalServerError("Failed to subscribe to newsletter");
    }
  },
  async customGoogleCallback(ctx) {
    const { access_token } = ctx.query;

    if (!access_token) {
      return ctx.badRequest("Missing access_token");
    }

    try {
      // 👉 1. Lấy thông tin user từ Google API
      const userRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { email, name, picture } = userRes.data;
      if (!email) return ctx.badRequest("Cannot get email from Google");

      // 👉 2. Kiểm tra user đã tồn tại chưa
      let user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { email } });

       
      // 👉 3. Nếu chưa tồn tại -> tạo mới
      if (!user) {
        const publicRole = await strapi
          .query("plugin::users-permissions.role")
          .findOne({
            where: { type: "public" },
          });

        if (!publicRole) {
          throw new Error("Public role not found");
        }
        user = await strapi.db.query("plugin::users-permissions.user").create({
          data: {
            username: name || email.split("@")[0],
            email,
            provider: "google",
            role: publicRole.id,
            confirmed: true,
          },
        });
        console.log(`🆕 Created new user: ${email}`);
      } else {
        console.log(`✅ Found existing user: ${email}`);
      }

      // 👉 4. Sinh JWT có thêm email
      const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
        id: user.id,
        email: user.email,
      });

      // 👉 5. Redirect về frontend kèm JWT
      ctx.redirect(`http://localhost:5173?token=${jwt}`);

    } catch (err) {
      console.error("❌ Google callback error:", err.response?.data || err.message);
      ctx.internalServerError("Google auth failed");
    }
  },
};
