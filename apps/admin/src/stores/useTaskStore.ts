import { toast } from "sonner"
import { create } from "zustand"

import { CLIENT_MSG } from "@repo/i18n"
import { apiGetTaskById, apiUpdateTask } from "@/api/adminTaskApi"

interface ITaskStoreState {
  loading: boolean
  initialized: boolean

  getTaskById: (task_id: number, onSuccessCallback?: (data:any) => void, onFailedCallback?: () => void) => void
  updateTask: (taskData: any, onSuccessCallback?: (data:any) => void, onFailedCallback?: () => void) => void
}

const useTaskStore = create<ITaskStoreState>()((set, get) => ({
  initialized: false,
  loading: false,

  getTaskById: async (task_id: number, onSuccessCallback, onFailedCallback) => {
    try {
      set({ loading: true })

      const response = await apiGetTaskById(task_id)

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

  updateTask: async (taskData: any, onSuccessCallback, onFailedCallback) => {
    try {
      set({ loading: true })

      const response = await apiUpdateTask(taskData)

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

export default useTaskStore
