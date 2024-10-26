import api from "./api"

// Get all users 
export const apiGetTasks = (param:any) => api().post("/admin/task/get", param)

export const apiGetTaskById = (task_id: number) => api().post('/admin/task/getTaskById', { task_id })

export const apiUpdateTask = (data: any) => api().post("/admin/task/update", data)

