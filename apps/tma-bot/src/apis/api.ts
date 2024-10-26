import { retrieveLaunchParams } from "@tma.js/sdk"
import axios, { AxiosInstance } from "axios"

const { initDataRaw } = retrieveLaunchParams()

const baseURL = import.meta.env.VITE_API_URL || ""

const api = () => {
  const instance: AxiosInstance = axios.create({
    baseURL,
    withCredentials: false,
    timeout: 20000,
    timeoutErrorMessage: "Timeout error occurred. Please try again later.",
    headers: {
      Authorization: `mgt ${initDataRaw}`
    }
  })

  return instance
}

export const telegramBotApi = () => {
  const instance: AxiosInstance = axios.create({
    baseURL: 'https://api.telegram.org/',
    timeout: 20000,
    timeoutErrorMessage: "Timeout error occurred. Please try again later.",
  })

  return instance
}

export default api