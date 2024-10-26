import React from "react";
import { Dispatch, FC, SetStateAction } from "react";
import { Modal } from "@telegram-apps/telegram-ui";
import { ModalHeader } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader";
import { IoIosInformationCircleOutline } from "react-icons/io"
import BaseButton from "@/components/buttons/BaseButton";

interface Props {
  weapon: Record<string, any>,
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  handlePurchaseItem: (item: any) => void
}

const WeaponModal: FC<Props> = ({ weapon, open, setOpen, handlePurchaseItem }) => {
  return (
    <Modal
      className="z-[2000] bg-[#1A1A1A] h-[57vh] border-t-[1px] border-[#FFAB0A] drop-shadow-[0_2px_20px_rgba(255,171,10,0.7)]"
      open={open}
      onOpenChange={setOpen}
      header={<ModalHeader className="before:!bg-[#C4C4C466]">Weapon Detail</ModalHeader>}
      nested
    >
      <div className="mt-7 mb-5 grid grid-cols-2 justify-between items-start gap-4 px-5">
        <div className="relative flex-none w-full">
          <img src={`${import.meta.env.VITE_API_STATIC_URL}/${weapon?.image}`} alt={`${weapon?.name}`} />
        </div>
        <div className="">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-base font-bold text-white overflow-hidden whitespace-nowrap text-ellipsis max-w-[60%]">{weapon?.name}</div>
            <IoIosInformationCircleOutline className="h-4 w-4 text-[#9F9F9F]" />
          </div>

          <div className="mb-2 h-[1px] w-full border-t border-[#4F4F4F66]" />

          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-normal text-[#9F9F9F]">Type</div>
            <div className="text-xs font-semibold text-white">
              {weapon?.type}
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-normal text-[#9F9F9F]">Price</div>
            <div className="text-xs font-semibold text-white">
              {weapon?.price}
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-normal text-[#9F9F9F]">Quantity</div>
            <div className="text-xs font-semibold text-white">
              {weapon?.quantity}
            </div>
          </div>

          <div className="mt-5 mb-2 flex items-center justify-between">
            <BaseButton onClick={() => { console.log('clicked'); handlePurchaseItem(weapon) }}>Purchase</BaseButton>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default WeaponModal