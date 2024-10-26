import React, { useCallback, useEffect, useState } from "react"

import AdminLayout from "@/components/_layout/AdminLayout"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@repo/ui/components/ui/breadcrumb"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/components/ui/table"
import { Button } from "@ui/components/ui/button"
import { LuClipboardEdit, LuEye, LuPlus } from "react-icons/lu"
import { useRobots } from "@/hooks/useRobots"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@ui/components/ui/pagination"
import { EditRobot } from "./components/EditRobot"
import { useNavigate } from "react-router-dom"

export default function Robots() {

  const navigate = useNavigate()
  const { getRobots, loading } = useRobots()

  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [startPage, setStartPage] = useState(0)
  const [endPage, setEndPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedRobotId, setSelectedRobotId] = useState(-1)
  const [robots, setRobots] = useState<Array<Record<string, any>>>([])

  const refreshPage = useCallback((page: number, pageSize: number) => {
    getRobots({ page, pageSize }).then(res => {
      setRobots(res.robots)
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

  const handleEdit = useCallback((id: number) => {
    setSelectedRobotId(id)
    setOpenEditDialog(true)
  }, [])

  const handleView = useCallback((id: number) => {
    // setSelectedRobotId(id)
    // setOpenEditDialog(true)
    navigate("/robots/" + id)
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
              <BreadcrumbPage className="text-main text-sm font-semibold">Robots</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      <div className="flex flex-col p-4">
        <div className="flex justify-end mb-2">
          <Button className="h-auto rounded-xl py-4 text-sm font-semibold text-white" onClick={() => handleEdit(-1)}>
            <LuPlus className="mr-2 text-base" /> Add a new robot
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Robot Image</TableHead>
              <TableHead>Owner Type</TableHead>
              <TableHead>Robot Name</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Price</TableHead>
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
              (!loading && robots && robots.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7}>No data</TableCell>
                </TableRow>
              )
            }
            {
              (!loading && robots && robots.length > 0) && robots?.map((robot: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="px-4 py-2">{startPage * limit + index + 1}</TableCell>
                  <TableCell className="px-4 py-2">
                    <img
                      className=" h-12 w-12 rounded-sm"
                      src={`${import.meta.env.VITE_API_URL}/static/${robot.image}`}
                      alt={robot.name}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2">{robot.owner_type}</TableCell>
                  <TableCell className="px-4 py-2">{robot.name}</TableCell>
                  <TableCell className="px-4 py-2">{robot.score}</TableCell>
                  <TableCell className="px-4 py-2">{robot.level}</TableCell>
                  <TableCell className="px-4 py-2">{robot.price}</TableCell>
                  <TableCell className="px-4 py-2">
                    <Button className="h-auto rounded-xl py-4 text-sm font-semibold text-white" onClick={() => handleEdit(robot.id)}>
                      <LuClipboardEdit className="mr-2 text-base" /> Edit
                    </Button>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <Button className="h-auto rounded-xl py-4 text-sm font-semibold text-white" onClick={() => handleView(robot.id)}>
                      <LuEye className="mr-2 text-base" /> View
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
        <EditRobot robot_id={selectedRobotId} open={openEditDialog} close={onCloseEditDialog} />
      </div>
    </AdminLayout>
  )
}
