import React, { useCallback } from "react"

import AdminLayout from "@/components/_layout/AdminLayout"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@repo/ui/components/ui/breadcrumb"
import { Button } from "@ui/components/ui/button"
import { LuClipboardEdit, LuEye, LuPlus } from "react-icons/lu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@ui/components/ui/pagination"
import { useNavigate } from "react-router-dom"
import { useWeapons } from "@/hooks/useWeapons"
import { EditWeapon } from "./components/EditWeapon"

export default function Weapons() {

  const navigate = useNavigate()
  const { getWeapons, loading } = useWeapons()

  const [limit, setLimit] = React.useState(10)
  const [startPage, setStartPage] = React.useState(0)
  const [endPage, setEndPage] = React.useState(0)
  const [total, setTotal] = React.useState(0)
  const [weapons, setWeapons] = React.useState<Array<Record<string, any>>>([])
  const [selectedWeaponId, setSelectedWeaponId] = React.useState(-1);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);


  const refreshPage = useCallback((page: number, pageSize: number) => {
    getWeapons({ page, pageSize }).then(res => {
      setWeapons(res.weapons)
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

  const handleEdit = React.useCallback((id: number) => {
    setSelectedWeaponId(id);
    setOpenEditDialog(true)
  }, [])

  const handleView = useCallback((id: number) => {
    navigate("/weapons/" + id)
  }, [])

  const onCloseEditDialog = useCallback(() => {
    setOpenEditDialog(false)
    refreshPage(startPage, limit)
  }, [startPage, limit])

  React.useEffect(() => {
    refreshPage(0, limit)
  }, [])

  React.useEffect(() => {
    const pageNum = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0)
    setEndPage(pageNum)
  }, [total])

  return (
    <AdminLayout
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-main text-sm font-semibold">Weapons</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      <div className="flex flex-col p-4">
        <div className="flex justify-end mb-2">
          <Button className="h-auto rounded-xl py-4 text-sm font-semibold text-white" onClick={() => handleEdit(-1)}>
            <LuPlus className="mr-2 text-base" /> Add a new weapon
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Weapon Image</TableHead>
              <TableHead>Owner Type</TableHead>
              <TableHead>Weapon Type</TableHead>
              <TableHead>Weapon Name</TableHead>
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
              (!loading && weapons && weapons.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7}>No data</TableCell>
                </TableRow>
              )
            }
            {
              (!loading && weapons && weapons.length > 0) && weapons?.map((weapon: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="px-4 py-2">{startPage * limit + index + 1}</TableCell>
                  <TableCell className="px-4 py-2">
                    <img
                      className=" h-12 w-12 rounded-sm"
                      src={`${import.meta.env.VITE_API_URL}/static/${weapon.image}`}
                      alt={weapon.name}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2">{weapon.owner_type}</TableCell>
                  <TableCell className="px-4 py-2">{weapon.name}</TableCell>
                  <TableCell className="px-4 py-2">{weapon.type}</TableCell>
                  <TableCell className="px-4 py-2">{weapon.price}</TableCell>
                  <TableCell className="px-4 py-2">
                    <Button className="h-auto rounded-xl py-4 text-sm font-semibold text-white" onClick={() => handleEdit(weapon.id)}>
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
        <EditWeapon weapon_id={selectedWeaponId} open={openEditDialog} close={onCloseEditDialog} />
      </div>
    </AdminLayout>
  )
}
