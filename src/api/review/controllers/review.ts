// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::review.review', ({ strapi }) => ({
//   async create(ctx) {
//     const user = ctx.state.user; // user đang login

//     if (!user) {
//       return ctx.unauthorized(`Bạn phải đăng nhập để đánh giá`);
//     }

//     const response = await strapi.entityService.create('api::review.review', {
//       data: {
//         ...ctx.request.body.data,
//         users_permissions_user: user.id, // gắn user tự động
//       },
//       populate: {
//         product: true,
//         users_permissions_user: { fields: ['id', 'username', 'email'] }
//       }
//     });

//     return { data: response };
//   }
// }));

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::review.review');
