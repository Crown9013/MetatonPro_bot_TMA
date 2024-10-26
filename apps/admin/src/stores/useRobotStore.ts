import { toast } from "sonner"
import { create } from "zustand"

import { CLIENT_MSG } from "@repo/i18n"
import { apiGetRobot, apiUpdateRobot, apiUpdateRobotAttribute } from "@/api/adminRobotsApi"

interface IRobotStoreState {
  loading: boolean
  initialized: boolean

  getRobotById: (robot_id: number, onSuccessCallback?: (data:any) => void, onFailedCallback?: () => void) => void
  updateRobot: (robotData: any, onSuccessCallback?: (data:any) => void, onFailedCallback?: () => void) => void
  updateRobotAttribute: (robotAttributeData: any, onSuccessCallback?: (data:any) => void, onFailedCallback?: () => void) => void
}

const useRobotStore = create<IRobotStoreState>()((set, get) => ({
  initialized: false,
  loading: false,

  getRobotById: async (robot_id: number, onSuccessCallback, onFailedCallback) => {
    try {
      set({ loading: true })

      const response = await apiGetRobot(robot_id)

      if (response?.data) {
        const { data } = response.data

        if (typeof onSuccessCallback === "function") {
          onSuccessCallback(data)
        }
      }
    } catch (err: any) {
      console.error(err)

      if (err?.response?.data?.message) {
        toast.error(err.response.data.message)
      } else {
        toast.error(CLIENT_MSG.SOMETHING_WENT_WRONG)
      }

      if (typeof onFailedCallback === "function") {
        onFailedCallback()
      }
    } finally {
      set({ loading: false })
    }
  },

  updateRobot: async (robotData: any, onSuccessCallback, onFailedCallback) => {
    try {
      set({ loading: true })

      const response = await apiUpdateRobot(robotData)

      if (response?.data) {
        const { data } = response.data

        if (typeof onSuccessCallback === "function") {
          onSuccessCallback(data)
        }
      }
    } catch (err: any) {
      console.error(err)

      if (err?.response?.data?.message) {
        toast.error(err.response.data.message)
      } else {
        toast.error(CLIENT_MSG.SOMETHING_WENT_WRONG)
      }

      if (typeof onFailedCallback === "function") {
        onFailedCallback()
      }
    } finally {
      set({ loading: false })
    }
  },

  updateRobotAttribute: async (robotAttributeData: any, onSuccessCallback, onFailedCallback) => {
    try {
      set({ loading: true })

      const response = await apiUpdateRobotAttribute(robotAttributeData)

      if (response?.data) {
        const { data } = response.data

        if (typeof onSuccessCallback === "function") {
          onSuccessCallback(data)
        }
      }
    } catch (err: any) {
      console.error(err)

      if (err?.response?.data?.message) {
        toast.error(err.response.data.message)
      } else {
        toast.error(CLIENT_MSG.SOMETHING_WENT_WRONG)
      }

      if (typeof onFailedCallback === "function") {
        onFailedCallback()
      }
    } finally {
      set({ loading: false })
    }
  },

}))

export default useRobotStore
