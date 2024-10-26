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

import { Button } from "@ui/components/ui/button"
import { LuClipboardEdit, LuPlus } from "react-icons/lu"
import { useTasks } from "@/hooks/useTasks"
import { EditTask } from "./components/EditTask"

export default function Tasks() {

  const { getTasks, loading } = useTasks()

  const [startPage, setStartPage] = useState(0)
  const [endPage, setEndPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [tasks, setTasks] = useState<Array<Record<string, any>>>([])

  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(-1)

  const refreshPage = useCallback((page: number, pageSize: number) => {
    console.log(page, pageSize)
    getTasks({ page, pageSize }).then(res => {
      setTasks(res.tasks)
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

  const onClickEdit = useCallback((id: number) => {
    setSelectedTaskId(id)
    setOpenEditDialog(true)
  }, [])

  const onCloseEditDialog = useCallback(() => {
    setOpenEditDialog(false)
    refreshPage(startPage, limit)
  }, [startPage, limit])

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
        <div className="flex justify-end mb-2">
          <Button className="h-auto rounded-xl py-4 text-sm font-semibold text-white" onClick={() => onClickEdit(-1)}>
            <LuPlus className="mr-2 text-base" /> Add a new task
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Reward</TableHead>
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
              (!loading && tasks && tasks.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7}>No data</TableCell>
                </TableRow>
              )
            }
            {
              (!loading && tasks && tasks.length > 0) && tasks?.map((task: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="px-4 py-2">{startPage * limit + index + 1}</TableCell>
                  <TableCell className="px-4 py-2">
                    <img
                      className="h-8 w-8 rounded-sm"
                      src={`${import.meta.env.VITE_API_URL}/static/${task.icon}`}
                      alt={task.title}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2 uppercase">{task.type}</TableCell>
                  <TableCell className="px-4 py-2">{task.title}</TableCell>
                  <TableCell className="px-4 py-2">{task.description}</TableCell>
                  <TableCell className="px-4 py-2">{task.action}</TableCell>
                  <TableCell className="px-4 py-2">{task.reward}</TableCell>
                  <TableCell className="px-4 py-2">
                    <Button className="h-auto rounded-xl py-4 text-sm font-semibold text-white" onClick={() => onClickEdit(task.id)}>
                      <LuClipboardEdit className="mr-2 text-base" /> Edit
                    </Button>
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
        <EditTask task_id={selectedTaskId} open={openEditDialog} close={onCloseEditDialog} />
      </div>
    </AdminLayout>
  )
}
