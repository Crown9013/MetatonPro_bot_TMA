import React, { FC, useEffect, useState } from "react"

import { IoIosInformationCircleOutline } from "react-icons/io"
import { PiLightningLight } from "react-icons/pi"
import { Link } from "react-router-dom"


import { IconPackage } from "@/components/icons"
import ProgressBar from "@/components/BasicProgressBar"
import ImagePlaceholder from "@/components/ImagePlaceholder"

import useAuthStore from "@/stores/useAuthStore"
import { parseItems, parseRobot } from "@/utils/parser"
import { BOT_ITEM_TYPES, BOT_ROBOT_ITEM_POSITION } from "@repo/util/bot.constant"

import ItemSlot from "./ItemSlot"
import ItemDrawer from "./ItemDrawer"
import InformationDrawer from "./InformationDrawer"
import clsx from "clsx"
import useRobotStore from "@/stores/useRobotStore"
import LoadingOverlay from "@/components/LoadingOverlay"

interface Props {
  robot: Record<string, any>
  items: Array<Record<string, any>>
}

const RobotCard: FC<Props> = (props) => {
  const { robot, items } = props
  const authStore = useAuthStore()
  const { levelUpAction, loading } = useRobotStore()

  const [openSlot, setOpenSlot] = useState(false)
  const [openInformation, setOpenInformation] = useState(false)

  const [slotPosition, setSlotPosition] = useState("")
  const [slotType, setSlotType] = useState("")

  const [parsedRobot, setParsedRobot] = useState<Record<string, any>>({})
  const [parsedItems, setParsedItems] = useState<Array<Record<string, any>>>([])
  const [percent, setPercent] = useState(0)

  const handleSlotClick = (position: string, type: string) => () => {
    setSlotPosition(position)
    setSlotType(type)
    setOpenSlot(true)
  }

  const handleInformationClick = () => {
    setOpenInformation(true)
  }

  const handleLevelUP = async () => {
    if (Number(percent) >= 100)
      levelUpAction()
  }

  useEffect(() => {
    const newRobot = parseRobot(robot)
    setParsedRobot(newRobot)
  }, [robot])

  useEffect(() => {
    const newItems = parseItems(items)
    setParsedItems(newItems)
  }, [items])

  useEffect(() => {
    if (parsedRobot) {
      if (Number(parsedRobot.score) > 0) {
        const value = 100 * Number(authStore.baseScore + authStore.hourlyRewardPoint) / Number(parsedRobot.score)
        setPercent(value)
      } else {
        setPercent(0)
      }
    }
  }, [parsedRobot, authStore])

  return (
    <>
      <section className="relative mb-6">
        <ImagePlaceholder
          className="w-full"
          src={
            parsedRobot.image ? `${import.meta.env.VITE_API_STATIC_URL}/${parsedRobot.image}` : ""
          }
          alt="Background"
          w={375}
          h={375}
          borderRadius="rounded-[30px]"
        />

        <ItemSlot
          className="absolute left-[46%] top-[8%] h-[14.6%] w-[14.6%]"
          robot={parsedRobot}
          items={parsedItems}
          position={BOT_ROBOT_ITEM_POSITION.Top}
          type={BOT_ITEM_TYPES.Equipment}
          onSlotClick={handleSlotClick}
        />

        <ItemSlot
          className="absolute left-[17.6%] top-[26.6%] h-[14.6%] w-[14.6%]"
          robot={parsedRobot}
          items={parsedItems}
          position={BOT_ROBOT_ITEM_POSITION.HeadLeft}
          type={BOT_ITEM_TYPES.Shield}
          onSlotClick={handleSlotClick}
        />

        <ItemSlot
          className="absolute left-[65.6%] top-[32.8%] h-[14.6%] w-[14.6%]"
          robot={parsedRobot}
          items={parsedItems}
          position={BOT_ROBOT_ITEM_POSITION.HeadRight}
          type={BOT_ITEM_TYPES.Shield}
          onSlotClick={handleSlotClick}
        />

        <ItemSlot
          className="absolute left-[12.2%] top-[56.8%] h-[14.6%] w-[14.6%]"
          robot={parsedRobot}
          items={parsedItems}
          position={BOT_ROBOT_ITEM_POSITION.ArmLeft}
          type={BOT_ITEM_TYPES.Weapon}
          onSlotClick={handleSlotClick}
        />

        <ItemSlot
          className="absolute left-[42.6%] top-[50.1%] h-[14.6%] w-[14.6%]"
          robot={parsedRobot}
          items={parsedItems}
          position={BOT_ROBOT_ITEM_POSITION.Body}
          type={BOT_ITEM_TYPES.Armor}
          onSlotClick={handleSlotClick}
        />

        <ItemSlot
          className="absolute left-[81.8%] top-[50.4%] h-[14.6%] w-[14.6%]"
          robot={parsedRobot}
          items={parsedItems}
          position={BOT_ROBOT_ITEM_POSITION.Pet}
          type={BOT_ITEM_TYPES.Pet}
          onSlotClick={handleSlotClick}
        />

        <ItemSlot
          className="absolute left-[69.6%] top-[64%] h-[14.6%] w-[14.6%]"
          robot={parsedRobot}
          items={parsedItems}
          position={BOT_ROBOT_ITEM_POSITION.ArmRight}
          type={BOT_ITEM_TYPES.Weapon}
          onSlotClick={handleSlotClick}
        />

        <button
          className="absolute right-[4%] top-[4%] h-[6.4%] w-[6.4%] cursor-pointer rounded-full text-[#FFFFFF7F] hover:bg-[rgba(255,255,255,0.2)] hover:text-white"
          onClick={handleInformationClick}
        >
          <IoIosInformationCircleOutline className="h-full w-full" />
        </button>

        <Link
          to="/store"
          className="absolute bottom-[4%] right-[4%] h-[6.4%] w-[6.4%] cursor-pointer rounded-2xl text-[#FFFFFF7F] hover:bg-[rgba(255,255,255,0.2)] hover:text-white"
        >
          <IconPackage className="h-full w-full" />
        </Link>
      </section>

      <section className="mb-4 flex items-center justify-between px-5">
        <PiLightningLight className="mr-2 h-6 w-6 text-[#3CF9FB]" />
        <span className="mr-4 text-base font-medium text-white">LV {parsedRobot.level}</span>
        <ProgressBar progress={percent} />
      </section>

      <section className="mb-6 flex items-center justify-center px-5">
        <div className={clsx("font-[400] uppercase cursor-pointer", Number(percent) < 100 ? "text-[#292829]" : "text-white")} onClick={handleLevelUP}>Level Up</div>
      </section>

      <section className="flex justify-between mb-2 px-5">
        <div>
          <Link to="#" className="text-base font-[400] text-[#F34747] uppercase">Arena</Link>
        </div>
        <div>
          <Link to="#" className="text-base font-[400] uppercase text-white">Boost</Link>
        </div>
      </section>

      <ItemDrawer
        robot={parsedRobot}
        items={parsedItems}
        position={slotPosition}
        type={slotType}
        open={openSlot}
        setOpen={setOpenSlot}
      />

      <InformationDrawer
        robot={parsedRobot}
        items={parsedItems}
        open={openInformation}
        setOpen={setOpenInformation}
      />

      {
        loading && <LoadingOverlay loading />
      }
    </>
  )
}

export default RobotCard
