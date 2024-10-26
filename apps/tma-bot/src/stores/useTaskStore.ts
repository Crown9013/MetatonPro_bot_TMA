import { apiGetObjectives, apiObjectiveComplete, apiGetCompletedObjectives, apiGetDailyRewards, apiCheckDailyRewards, apiCheckChatMember } from "@/apis/tasksApi";
import { CheckChatMemberRequestDataType, CompletedObjectivesRequestDataType } from "@/types";
import { create } from "zustand";

interface ITaskState {
  loading: boolean
  initialized: boolean

  objectives: Record<any, any> | null
  completedObjectives: Record<any, any> | null
  dailyRewards: Record<any, any> | null

  refresh: () => Promise<any>
  getObjectives: (onSuccessCallback?: () => void, onFailureCallback?: () => void) => Promise<void>
  getCompletedObjectives: (onSuccessCallback?: () => void, onFailureCallback?: () => void) => Promise<void>
  objectiveComplete: (param: CompletedObjectivesRequestDataType, onSuccessCallback?: () => void, onFailureCallback?: () => void) => Promise<void>
  checkChatMember: (param: CheckChatMemberRequestDataType, onSuccessCallback?: (data:any) => void, onFailureCallback?: (err:any) => void) => Promise<void>
  checkDailyRewards: (onSuccessCallback?: () => void, onFailureCallback?: (err:any) => void) => Promise<void>
}

const useTaskStore = create<ITaskState>()((set, get) => ({
  loading: false,
  initialized: false,

  objectives: null,
  completedObjectives: null,
  dailyRewards: null,

  getObjectives: async (onSuccessCallback, onFailureCallback) => {
    try {
      set({ loading: true })
      set({ initialized: false })

      const response = await apiGetObjectives()

      if (response?.data) {
        const { data } = response.data
        
        set({ objectives: data })

        if (typeof onSuccessCallback === "function") {
          onSuccessCallback()
        }
      }
    } catch (e) {
      console.error(e)
      if (typeof onFailureCallback === 'function') {
        onFailureCallback()
      }
    } finally {
      set({ loading: false })
      set({ initialized: true })
    }
  },

  getCompletedObjectives: async (onSuccessCallback, onFailureCallback) => {
    try {
      const response = await apiGetCompletedObjectives()

      if (response?.data) {
        const { data } = response.data
        
        set({ completedObjectives: data })

        if (typeof onSuccessCallback === "function") {
          onSuccessCallback()
        }
      }

    } catch (e) {
      console.error(e)
      if (typeof onFailureCallback === 'function') {
        onFailureCallback()
      }
    } finally {
      set({ loading: false })
      set({ initialized: true })
    }
  },

  refresh: async () => {
    try {
      set({ loading: true })

      const response = await apiGetObjectives()

      if (response?.data) {
        const { data } = response.data
        set({ objectives: data })
      }
      
      const response1 = await apiGetCompletedObjectives()

      if (response1?.data) {
        const { data } = response1.data
        set({ completedObjectives: data })
      }

      const response2 = await apiGetDailyRewards()

      if (response2?.data) {
        const { data } = response2.data
        set({ dailyRewards: data })
      }

    } catch (e) {
      console.error(e)
    } finally {
      set({ loading: false })
    }
  },

  objectiveComplete: async (param, onSuccessCallback, onFailureCallback) => {
    try {
      set({ loading: true })

      const response = await apiObjectiveComplete(param)

      if (typeof onSuccessCallback === 'function') {
        onSuccessCallback()
      }
    } catch (e) {
      console.error(e)
      if (typeof onFailureCallback === 'function') {
        onFailureCallback()
      }
    } finally {
      set({ loading: false })
      set({ initialized: true })
    }
  } ,

  checkChatMember: async (param, onSuccessCallback, onFailureCallback) => {
    try {
      set({ loading: true })
      const response = await apiCheckChatMember(param)
      console.log(response)
      if (response && response.status) {
        if (typeof onSuccessCallback === 'function') {
          onSuccessCallback(response.data)
        }
      } else {
        if (typeof onFailureCallback === 'function') {
          onFailureCallback(response?.data)
        }
      }
    } catch (e) {
      console.error(e)
      if (typeof onFailureCallback === 'function') {
        onFailureCallback(e)
      }
    } finally {
      set({ loading: false })
    }
  },

  checkDailyRewards: async (onSuccessCallback, onFailureCallback) => {
    try {
      set({ loading: true })
      
      const response = await apiCheckDailyRewards()

      if (typeof onSuccessCallback === 'function') {
        onSuccessCallback()
      }
    } catch (e) {
      console.error(e)
      if (typeof onFailureCallback === 'function') {
        onFailureCallback(e)
      }
    } finally {
      set({ loading: false })
    }
  }

}))

export default useTaskStore
