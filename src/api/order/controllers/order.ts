/**
 * order controller
 */

import { factories } from "@strapi/strapi";

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
      const MDH = `MDH${dateCode}-${randomNumber}`;

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
          statusOrder: "pending",
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
}));
