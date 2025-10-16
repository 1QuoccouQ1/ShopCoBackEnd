/**
 * newsletter router
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/newsletter/subscribe",
      handler: "newsletter.subscribe",
      config: {
        auth: false, 
      },
    },
    {
      method: "GET",
      path: "/auth/google/custom-callback",
      handler: "newsletter.customGoogleCallback",
      config: {
        auth: false, 
      },
    },
  ],
};