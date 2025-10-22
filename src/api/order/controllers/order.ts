/**
 * order controller
 */

import { factories } from "@strapi/strapi";
import axios from "axios";

export default factories.createCoreController("api::order.order", ({ strapi }) => ({
  async createOrder(ctx) {
    try {
      const {
        fullName,
        email,
        phone,
        address,
        note,
        paymentMethod,
        cartItems = [],
        userId
      } = ctx.request.body.data;

      if (!fullName || !email || !phone || !address || !paymentMethod) {
        return ctx.badRequest("Missing required fields");
      }


      const subtotal = cartItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      const deliveryFee = 15;
      const total = subtotal + deliveryFee;

      const today = new Date();
      const dateCode = today
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, ""); 
      const randomNumber = Math.floor(100000 + Math.random() * 900000); 
      const MDH = `MDH${dateCode}${randomNumber}`;
      const statusOrder = paymentMethod.toUpperCase() === "COD" ? "shipping" : "pending";
      console.log("Creating order with data:",ctx.request.body.data)
      console.log("Creating order with data:",statusOrder)

     const order = await strapi.entityService.create("api::order.order", {
        data: {
          MDH,
          full_name: fullName,
          email,
          phone,
          address,
          note,
          payment_method: paymentMethod.toUpperCase(),
          total_price: total,
          statusOrder: statusOrder,
          publishedAt: new Date(),
          ...(userId ? { user_name: userId } : {}),
          Type: userId ? "User" : "Visitors",
        },
      });

      if (cartItems.length > 0) {
        for (const item of cartItems) {
          await strapi.entityService.create("api::order-item.order-item", {
            data: {
              product_name: item.product_name,
              color: item.color,
              size: item.size,
              price: item.price,
              quantity: item.quantity,
              product_image: item.product_image,
              publishedAt: new Date(),
              product: item.id, 
              order: {
                connect: [order.id],
            } as any,
            },
          });
        }
      }

      return ctx.send({
        message: "Order created successfully",
        MDH,
        orderId: order.id,
        documentId: order.documentId,
        fullName: order.full_name,
        address: order.address,
        phone: order.phone,
        paymentMethod: order.payment_method,
        total,
        createdAt: order.createdAt, 
      });
    } catch (error) {
      strapi.log.error("Error creating order:", error);
      return ctx.internalServerError("Failed to create order");
    }
  },
  async sepayCallback(ctx) {
  try {
    const payload = ctx.request.body;
    const amount = payload.transferAmount;

    if (!payload.code) {
      console.error("⚠️ Không tìm thấy mã đơn hàng trong payload");
      return ctx.badRequest("Missing order code");
    }

   
    if (payload.code) {
      const updated = await strapi.db.query("api::order.order").update({
        where: { MDH: payload.code },
        data: {
          statusOrder: "shipping", 
        },
      });

      if (updated) {
        console.log(
          `✅ [Order ${payload.code}] Đã cập nhật thành công: PAID (${amount}₫)`
        );
      } else {
        console.warn(`⚠️ Không tìm thấy đơn hàng: ${payload.code}`);
      }
    } else {
      console.log(
        `ℹ️ [Order ${payload.code}] Callback không phải thanh toán thành công (${amount}₫)`
      );
    }
    ctx.send({ ok: true });
  } catch (err) {
    console.error("❌ Lỗi xử lý callback SePay:", err);
    ctx.throw(500, "Webhook error");
  }
},
 async testSepayCallback(ctx) {
    try {
      const { id } = ctx.params; 
      if (!id) {
        return ctx.badRequest("Missing MDH parameter");
      }

      const order = await strapi.db.query("api::order.order").findOne({
        where: { MDH: id },
        select: ["id", "MDH", "statusOrder"],
      });

      if (!order) {
        return ctx.notFound("Order not found");
      }

      // Nếu đã shipping
      if (order.statusOrder === "shipping") {
        return ctx.send({
          success: true,
          message: "Order is now shipping",
          status: order.statusOrder,
        });
      }

      // Nếu chưa shipping
      return ctx.send({
        success: false,
        message: `Order not yet shipping (current: ${order.statusOrder})`,
        status: order.statusOrder,
      });
    } catch (err) {
      console.error("❌ Error in testSepayCallback:", err);
      return ctx.internalServerError("Server error");
    }
  },

}));
