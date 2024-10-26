import React, { useCallback, useEffect, useState } from "react"

import AdminLayout from "@/components/_layout/AdminLayout"

import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage
} from "@repo/ui/components/ui/breadcrumb"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@repo/ui/components/ui/table"

import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from "@repo/ui/components/ui/pagination"

import { useUsers } from "@/hooks/useUsers"
import { Button } from "@ui/components/ui/button"
import { LuClipboardEdit } from "react-icons/lu"
import { Toaster } from "sonner"
import { formatDate } from "@/utils/format"

export default function Users() {

  const { getUser, loading } = useUsers()

  const [startPage, setStartPage] = useState(0)
  const [endPage, setEndPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [users, setUsers] = useState<Array<Record<string, any>>>([])

  const refreshPage = useCallback((page: number, pageSize: number) => {
    console.log(page, pageSize)
    getUser({ page, pageSize }).then(res => {
      console.log(res.user)
      setUsers(res.user)
      setTotal(res.total)
    })
  }, [])

  const handlePaginationPrevious = useCallback(() => {
    if (startPage - 1 >= 0) {
      refreshPage(startPage - 1, limit)
      setStartPage(startPage - 1)
    }
  }, [refreshPage, startPage, setStartPage])

  const handlePaginationNext = useCallback(() => {
    if (startPage + 1 < endPage) {
      console.log(startPage + 1)
      refreshPage(startPage + 1, limit)
      setStartPage(startPage + 1)
    }
  }, [startPage, endPage, setStartPage, refreshPage])

  useEffect(() => {
    refreshPage(0, limit)
  }, [])

  useEffect(() => {
    const pageNum = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0)
    setEndPage(pageNum)
  }, [total])

  return (
    <AdminLayout
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-main text-sm font-semibold">Users</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      <div className="flex flex-col p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Referral Count</TableHead>
              <TableHead>Is Online</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              loading && (
                <TableRow>
                  <TableCell colSpan={7}>Loading...</TableCell>
                </TableRow>
              )
            }
            {
              (!loading && users && users.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7}>No data</TableCell>
                </TableRow>
              )
            }
            {
              (!loading && users && users.length > 0) && users?.map((user: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="px-4 py-2">{startPage * limit + index + 1}</TableCell>
                  <TableCell className="px-4 py-2">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.tg_avatar ? user.tg_avatar : '/avatar-default.svg'}
                      alt={user.tg_username}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2">{user.tg_username}</TableCell>
                  <TableCell className="px-4 py-2">{formatDate(user.created_at)}</TableCell>
                  <TableCell className="px-4 py-2">{user.score}</TableCell>
                  <TableCell className="px-4 py-2">{user.referrals.length}</TableCell>
                  <TableCell className="px-4 py-2">{user.is_online === 1 ? 'Online' : 'Offline'}</TableCell>
                  <TableCell className="px-4 py-2">{user.status === 1 ? 'Active' : 'Blocked'}</TableCell>
                  <TableCell className="px-4 py-2">
                    {/* <Button className="h-auto rounded-xl py-4 text-sm font-semibold text-white">
                      <LuClipboardEdit className="mr-2 text-base" /> Edit
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
        <div className="flex justify-between mt-4">
          <div>
            Total: {total}
          </div>
          <div>
            <Pagination>
              <PaginationPrevious onClick={handlePaginationPrevious} />
              <PaginationContent>
                <PaginationItem>{startPage + 1}</PaginationItem>
              </PaginationContent>
              <PaginationNext onClick={handlePaginationNext} />
            </Pagination>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
