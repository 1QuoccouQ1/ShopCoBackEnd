export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/custom',
      handler: 'order.createOrder',
      config: {
        auth: false,
      },
    },
  ],
};
