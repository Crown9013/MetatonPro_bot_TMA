import { toast } from "sonner"
import { create } from "zustand"

import { apiRobotLevelUp, apiRobotSetItem,  apiWeaponGet} from "@/apis/robotApi"

import { CLIENT_MSG } from "@repo/i18n"

import useAuthStore from "./useAuthStore"

interface IRobotState {
  loading: boolean

  setItemAction: (param: any, onSuccessCallback?: (data: any) => void) => void
  levelUpAction: (ponSuccessCallback?: (data: any) => void) => void
  getWeaponItem: (item_id: number, onSuccessCallback?: (data: any) => void) => void
}

const useRobotStore = create<IRobotState>()((set, get) => ({
  loading: false,

  setItemAction: async (param, onSuccessCallback) => {
    const { refreshRobotsAndItems } = useAuthStore.getState()

    try {
      set({ loading: true })

      const response = await apiRobotSetItem(param)

      if (response?.data) {
        const { data } = response.data

        refreshRobotsAndItems(data)

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
    } finally {
      set({ loading: false })
    }
  },

  levelUpAction: async (onSuccessCallback) => {
    try {
      set({ loading: true })
      const response = await apiRobotLevelUp()

      if (response?.data) {
        const { data } = response.data

        if (typeof onSuccessCallback === "function") {
          onSuccessCallback(data)
        }
      }

    } catch (err:any) {
      console.error(err)

      if (err?.response?.data?.message) {
        toast.error(err.response.data.message)
      } else {
        toast.error(CLIENT_MSG.SOMETHING_WENT_WRONG)
      }
    } finally {
      set({loading: false})
    }
  },

  getWeaponItem: async (item_id, onSuccessCallback) => {
    try {
      set({ loading: true });

      const response = await apiWeaponGet(item_id);

      if (response?.data) {
        const { data } = response.data

        if (typeof onSuccessCallback === "function") {
          onSuccessCallback(data)
        }
      } else {
        if (typeof onSuccessCallback === "function") {
          onSuccessCallback(null)
        }
      }

    } catch (err: any) {
      console.error(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message)
      } else {
        toast.error(CLIENT_MSG.SOMETHING_WENT_WRONG)
      }
    } finally {
      set({loading: false})
    }
  }
}))

export default useRobotStore
