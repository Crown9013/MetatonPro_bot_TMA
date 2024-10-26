import api from "./api"

// Get all users 
export const apiGetRobots = (param: any) => api().post("/admin/robots/get", param)

export const apiGetRobot = (robot_id: number) => api().post("/admin/robots/getRobotById", { robot_id })

export const apiUpdateRobot = (data: any) => api().post("/admin/robots/update", data)

export const apiUpdateRobotAttribute = (data: any) => api().post("/admin/robots/update_attribute", data)

