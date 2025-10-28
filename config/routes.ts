export const ROUTES = {
  home: "/",
  onboarding: "/onboarding",
  auth: "/auth",
  login: "/auth/login",
  signup: "/auth/signup",
  forgotPassword: "/auth/forgot-password",
  otp: "/auth/otp",
  setup: "/auth/setup",
  app: {
    main: "/app",
    library: "/app/library",
    search: "/app/search",
    pen: "/app/pen",
    profile: "/app/profile",
    notification: "/app/notification",
  },
  allGenres: "/all-genres",
  test: "/test",
};

export const NAVIGATION_CONFIG = {
  defaultRoute: ROUTES.onboarding,
  authRequiredRoutes: [
    ROUTES.app.main,
    ROUTES.app.library,
    ROUTES.app.search,
    ROUTES.app.pen,
    ROUTES.app.profile,
    ROUTES.app.notification,
  ],
  guestOnlyRoutes: [
    ROUTES.auth,
    ROUTES.login,
    ROUTES.signup,
    ROUTES.forgotPassword,
    ROUTES.otp,
    ROUTES.setup,
    ROUTES.onboarding,
  ],
};
