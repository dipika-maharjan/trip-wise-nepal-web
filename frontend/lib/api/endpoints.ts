//backend route paths

export const API = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    CREATE_USER: "/api/auth/user",
    UPDATE_PROFILE: "/api/auth", // PUT /api/auth/:id
    REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
    RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
  },
  ADMIN: {
    USER: {
      CREATE: "/api/admin/users",
      GET_ALL: "/api/admin/users",
      GET_BY_ID: "/api/admin/users",
      UPDATE: "/api/admin/users", 
      DELETE: "/api/admin/users", 
    },
  },
  ACCOMMODATION: {
    GET_ALL: "/api/accommodations",
    GET_ACTIVE: "/api/accommodations/active",
    GET_BY_ID: "/api/accommodations",
    SEARCH: "/api/accommodations/search",
    PRICE_RANGE: "/api/accommodations/price-range",
    CREATE: "/api/accommodations",
    UPDATE: "/api/accommodations",
    DELETE: "/api/accommodations",
  },
};
