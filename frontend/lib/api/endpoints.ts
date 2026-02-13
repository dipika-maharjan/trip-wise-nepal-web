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
  ROOM_TYPE: {
    GET_ALL: "/api/room-types",
    GET_BY_ID: "/api/room-types",
    CREATE: "/api/room-types",
    UPDATE: "/api/room-types",
    DELETE: "/api/room-types",
  },
  OPTIONAL_EXTRA: {
    GET_ALL: "/api/optional-extras",
    GET_BY_ID: "/api/optional-extras",
    CREATE: "/api/optional-extras",
    UPDATE: "/api/optional-extras",
    DELETE: "/api/optional-extras",
  },
  BOOKING: {
    CREATE: "/api/bookings",
    GET_ALL: "/api/bookings/all",
    GET_MY_BOOKINGS: "/api/bookings/my-bookings",
    GET_BY_ID: "/api/bookings",
    CANCEL: "/api/bookings",
    UPDATE_STATUS: "/api/bookings",
    UPDATE: "/api/bookings",
    DELETE: "/api/bookings",
  },
};
