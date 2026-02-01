//backend route paths

export const API = {
  AUTH: {
    REGISTER: "api/auth/register",
    LOGIN: "api/auth/login",
    UPDATE_PROFILE: "api/auth", // PUT /api/auth/:id
  },
  ADMIN: {
    USER: {
      CREATE: "api/admin/users",
      GET_ALL: "api/admin/users",
      GET_BY_ID: "api/admin/users",
      UPDATE: "api/admin/users", 
      DELETE: "api/admin/users", 
    },
  },
};
