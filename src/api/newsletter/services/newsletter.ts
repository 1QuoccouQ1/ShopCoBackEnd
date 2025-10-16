import nodemailer from "nodemailer";

export default () => ({
  async sendWelcomeEmail(email: string) {
    try {
      strapi.log.info(`🚀 Sending email to: ${email}`);

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Kiểm tra cấu hình
      await transporter.verify();
      strapi.log.info("✅ SMTP connection verified");

    const info = await transporter.sendMail({
            from: `"Shop.co" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "🎉 Chào mừng bạn đến với Shop.co – Nơi thời trang hội tụ!",
            html: `
            <div style="font-family: 'Segoe UI', sans-serif; background-color: #f8f8f8; padding: 40px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                
                <div style="background-color: #000; padding: 24px 0; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 28px; letter-spacing: 1px;">SHOP.CO</h1>
                </div>
                
                <div style="padding: 32px;">
                    <h2 style="color: #111; font-size: 24px;">🎉 Chào mừng bạn đến với <span style="color: #000;">Shop.co</span>!</h2>
                    
                    <p style="color: #444; font-size: 16px; line-height: 1.6;">
                    Xin chào <strong>fashion lover</strong> 👋,<br><br>
                    Cảm ơn bạn đã tin tưởng và đăng ký nhận bản tin của chúng tôi 💌.
                    Từ bây giờ, bạn sẽ là người đầu tiên biết về:
                    </p>
                    <ul style="color: #333; font-size: 15px; line-height: 1.8;">
                    <li>✨ Ưu đãi độc quyền chỉ dành cho thành viên</li>
                    <li>🆕 Bộ sưu tập mới nhất theo xu hướng toàn cầu</li>
                    <li>💡 Mẹo phối đồ và phong cách từ các stylist hàng đầu</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 36px 0;">
                    <a href="https://shop.co" target="_blank" 
                        style="background-color: #000; color: #fff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; letter-spacing: 0.5px;">
                        MUA SẮM NGAY →
                    </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; text-align: center;">
                    Cảm ơn bạn đã là một phần của cộng đồng Shop.co 💛<br>
                    — Đội ngũ Shop.co
                    </p>
                </div>
                
                <div style="background-color: #f1f1f1; padding: 16px; text-align: center; font-size: 12px; color: #999;">
                    © ${new Date().getFullYear()} Shop.co – All Rights Reserved.
                </div>
                </div>
            </div>
            `,
            });


      strapi.log.info(`✅ Email sent successfully: ${info.messageId}`);
      return { success: true };
    } catch (error) {
      strapi.log.error("❌ Error in sendWelcomeEmail:", error);
      throw error; // ném ra để controller bắt được lỗi thật
    }
  },
});
