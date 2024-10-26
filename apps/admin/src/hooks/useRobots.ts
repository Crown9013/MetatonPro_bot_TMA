import { apiGetRobots } from "@/api/adminRobotsApi";
import { useEffect, useState } from "react";

type GetRobotsRequestProps = {
  page: number
  pageSize: number
}

export function useRobots() {
  const [loading, setLoading] = useState(false)

  const getRobots = async (param: GetRobotsRequestProps) => {
    try {
      setLoading(true)
      const res = await apiGetRobots(param)
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
    getRobots
  })
}