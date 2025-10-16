/**
 * product controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::product.product');


// export default factories.createCoreController("api::product.product", ({ strapi }) => ({
//   async findBySlug(ctx) {
//     const { slug } = ctx.params;
//     console.log("Fetching product with slug:", slug);

//     const entity = await strapi.entityService.findMany("api::product.product", {
//       filters: { slug: { $eq: slug } },
//       populate: ["image", "category", "reviews"],
//       limit: 1,
//     });

//     console.log("Fetched entity:", entity);

//     if (!entity || entity.length === 0) {
//       return ctx.notFound("Product not found");
//     }

//     return { data: entity[0] };
//   },
// }));