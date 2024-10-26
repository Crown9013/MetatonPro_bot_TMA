import { apiGetUsers } from "@/api/adminUserApi";
import { useEffect, useState } from "react";

type GetUserRequestProps = {
  page: number
  pageSize: number
}

export function useUsers() {
  const [loading, setLoading] = useState(false)

  const getUser = async (param: GetUserRequestProps) => {
    try {
      setLoading(true)
      const res = await apiGetUsers(param)
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
    getUser
  })
}