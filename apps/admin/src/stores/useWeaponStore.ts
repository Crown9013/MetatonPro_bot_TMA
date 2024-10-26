import { toast } from "sonner"
import { create } from "zustand"

import { CLIENT_MSG } from "@repo/i18n"
import { apiGetWeapons, apiGetWeapon, apiUpdateWeapon } from "@/api/adminWeaponsApi"

interface IWeaponStoreState {
  loading: boolean
  initialized: boolean

  getWeaponById: (weapon_id: number, onSuccessCallback?: (data:any) => void, onFailedCallback?: () => void) => void
  updateWeapon: (weaponData: any, onSuccessCallback?: (data:any) => void, onFailedCallback?: () => void) => void
}

const useWeaponStore = create<IWeaponStoreState>()((set, get) => ({
  initialized: false,
  loading: false,

  getWeaponById: async (weapon_id: number, onSuccessCallback, onFailedCallback) => {
    try {
      set({ loading: true })

      const response = await apiGetWeapon(weapon_id)

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

  updateWeapon: async (weaponData: any, onSuccessCallback, onFailedCallback) => {
    try {
      set({ loading: true })

      const response = await apiUpdateWeapon(weaponData)

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
  }

}))

export default useWeaponStore
