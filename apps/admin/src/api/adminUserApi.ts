import api from "./api"

// Get all users 
export const apiGetUsers = (param:any) => api().post("/admin/user/get", param)


