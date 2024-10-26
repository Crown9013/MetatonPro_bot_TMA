import { apiGetWeapons } from "@/api/adminWeaponsApi";
import { useEffect, useState } from "react";

type GetWeaponsRequestProps = {
  page: number
  pageSize: number
}

export function useWeapons() {
  const [loading, setLoading] = useState(false)

  const getWeapons = async (param: GetWeaponsRequestProps) => {
    try {
      setLoading(true)
      const res = await apiGetWeapons(param)
      if (res && res.status === 200) {
        return res.data.data
      } else {
        return null
      }
    } catch (e) {
      console.error(e)
      return []
    } finally {
      setLoading(false)
    }
  }

  return ({
    loading,
    getWeapons
  })
}