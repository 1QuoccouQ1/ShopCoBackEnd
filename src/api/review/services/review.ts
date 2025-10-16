// "use strict";

// const { createCoreService } = require("@strapi/strapi").factories;

// module.exports = createCoreService("api::review.review", ({ strapi }) => ({
//   async updateProductRating(productId) {
//     console.log("Updating average rating for product:", productId);
//     // Lấy tất cả review của product đó
//     const reviews = await strapi.db.query("api::review.review").findMany({
//       where: { product: productId },
//       select: ["rating"],
//     });

//     if (reviews.length === 0) {
//       await strapi.db.query("api::product.product").update({
//         where: { id: productId },
//         data: { average_rating: null },
//       });
//       return;
//     }

//     const total = reviews.reduce((sum, r) => sum + r.rating, 0);
//     const avg = total / reviews.length;
//     console.log(`New average rating for product ${productId} is ${avg}`);
//     // Update vào Product
//     await strapi.db.query("api::product.product").update({
//       where: { id: productId },
//       data: { average_rating: avg },
//     });
//   },
// }));
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::review.review');
