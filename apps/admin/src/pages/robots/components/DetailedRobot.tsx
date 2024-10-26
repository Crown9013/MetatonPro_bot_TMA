import React, { useCallback, useEffect, useState } from "react"
import { IoIosInformationCircleOutline } from "react-icons/io"
import { useNavigate, useParams } from "react-router-dom"
import useRobotStore from "@/stores/useRobotStore"
import { parseRobot } from "@/utils/parseRobot"
import AdminLayout from "@/components/_layout/AdminLayout"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@ui/components/ui/breadcrumb"
import { LoadingButton } from "@/components/_uiext"
import { Button } from "@ui/components/ui/button"
import { LuArrowBigLeft, LuSkipBack, LuStepBack } from "react-icons/lu"
import { EditRobotAttribute } from "./EditRobotAttribute"

export const DetailedRobot = () => {

  const { id } = useParams()
  const navigate = useNavigate()
  const robotStore = useRobotStore()

  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [robot, setRobot] = useState<any>(null)

  const back = () => {
    navigate("/robots/")
  }

  const refresh = useCallback(() => {
    if (id && Number(id) > -1) {
      robotStore.getRobotById(Number(id), (res) => {
        setRobot(parseRobot(res))
      })
    }
  }, [id, robotStore])

  const onCloseEditDialog = useCallback(() => {
    setOpenEditDialog(false)
    refresh()
  }, [])

  const handleEditAttribute = () => {
    setOpenEditDialog(true)
  }

  useEffect(() => {
    refresh()
  }, [id])

  return (
    <AdminLayout
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-main text-sm font-semibold">Robot Name: {robot?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      <div>
        <div className="flex">
          <Button onClick={back}>
            <LuArrowBigLeft />Back
          </Button>
        </div>
        <div className="mt-7 mb-5 grid grid-cols-2 justify-between items-start gap-4 px-5">
          <div className="relative flex-none w-fit m-auto">
            <img src={`${import.meta.env.VITE_API_URL}/static/${robot?.image}`} alt="Background" w={165} h={165} className="rounded-[13px]" />

            <div className="absolute bottom-0 left-0 right-0 h-[25%] rounded-b-[13px] bg-[linear-gradient(_#0C0A0C00_0%,_#0C0A0C99_24%,_#0C0A0CCC_82%,_#0C0A0CFF_100%)]" />

            <div className="absolute bottom-2 left-3 right-3 flex justify-between">

              <div className="text-[12px] font-bold text-white">LV {robot?.level}</div>
            </div>
          </div>

          <div className="">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-base font-bold text-white overflow-hidden whitespace-nowrap text-ellipsis max-w-[60%]">{robot?.name}</div>
              <IoIosInformationCircleOutline className="h-4 w-4 text-[#9F9F9F]" />
            </div>

            <div className="mb-2 h-[1px] w-full border-t border-[#4F4F4F66]" />

            {robot?.attributes &&
              Object.keys(robot?.attributes)
                .sort()
                .map((key) => (
                  <div key={key} className="mb-2 flex items-center justify-between">
                    <div className="font-normal text-[#9F9F9F] capitalize">{key}</div>
                    <div className="font-semibold text-black">
                      {Number(robot?.attributes?.[key])}
                    </div>
                  </div>
                ))}
          </div>
        </div>
        <div className="mt-4 flex">
          <LoadingButton onClick={handleEditAttribute}>
            Edit Attribute
          </LoadingButton>
        </div>
      </div>
      <EditRobotAttribute robot_id={Number(id)} open={openEditDialog} close={onCloseEditDialog} />
    </AdminLayout>

  )
}