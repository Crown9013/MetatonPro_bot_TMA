import { apiGetTasks } from "@/api/adminTaskApi";
import { useEffect, useState } from "react";

type GetTaskRequestProps = {
  page: number
  pageSize: number
}

export function useTasks() {
  const [loading, setLoading] = useState(false)

  const getTasks = async (param: GetTaskRequestProps) => {
    try {
      setLoading(true)
      const res = await apiGetTasks(param)
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
    getTasks
  })
}