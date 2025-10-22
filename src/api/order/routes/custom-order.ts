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
    {
      method: 'POST',
      path: '/payment/sepay-callback',
      handler: 'order.sepayCallback',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/payment/check-status/:id',
      handler: 'order.testSepayCallback',
      config: {
        auth: false,
      },
    },
  ],
};
