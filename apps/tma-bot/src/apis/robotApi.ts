import api from "./api"

export const apiRobotSetItem = (param: any) => api().post("/bot/robot/set-item", param)

export const apiRobotLevelUp = () => api().post('/bot/robot/level-up')

export const apiWeaponGet = (item_id: number) => api().post(`/bot/robot/weapons/${item_id}`)
