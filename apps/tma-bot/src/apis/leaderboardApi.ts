import api from "./api"

export const apiLeaderboardGet = () => api().post("/bot/leaderboard/get")
