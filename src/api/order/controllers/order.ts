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

      const orderCode = payload.code; 
      const paidAmount = Number(payload.transferAmount); 

      if (!orderCode || !paidAmount) {
        return ctx.badRequest("Thiếu thông tin mã đơn hàng hoặc số tiền.");
      }

      const order = await strapi.db.query("api::order.order").findOne({
        where: { MDH: orderCode },
      });

      if (!order) {
        console.warn(`⚠️ Không tìm thấy đơn hàng với MDH: ${orderCode}`);
        return ctx.notFound("Order not found");
      }
      
      const orderTotal = Number(order.total_price);

      console.log("Found order for callback:", paidAmount);
      console.log("Found order for callback:", orderTotal);

      if (paidAmount !== orderTotal) {
        console.warn(
          `⚠️ Thanh toán không hợp lệ cho đơn ${orderCode}: chưa đúng số tiền cần thanh toán`
        );
        return ctx.badRequest("Sai số tiền thanh toán");
      }

      if (order.statusOrder !== "shipping") {
        await strapi.db.query("api::order.order").update({
          where: { MDH: orderCode },
          data: {
            statusOrder: "shipping", 
          },
        });

        console.log(
          `✅ Đơn hàng ${orderCode} đã thanh toán thành công (${paidAmount}₫)`
        );
      } else {
        console.log(`ℹ️ Đơn hàng ${orderCode} đã ở trạng thái "shipping", bỏ qua.`);
      }

      return ctx.send({ ok: true, orderCode, paidAmount });
    } catch (err) {
      console.error("❌ Lỗi xử lý callback SePay:", err);
      return ctx.internalServerError("Webhook processing error");
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
