import React, { useEffect, useState, type FC } from "react"

import clsx from "clsx"
import { IoIosInformationCircleOutline } from "react-icons/io"
import { RiGlobalLine } from "react-icons/ri"

import { createAvatar } from "@dicebear/core"
import { initials } from "@dicebear/collection"

import PageLayout from "@/components/PageLayout"
import ImagePlaceholder from "@/components/ImagePlaceholder"

import useAuthStore from "@/stores/useAuthStore"
import useLeaderboardStore from "@/stores/useLeaderboardStore"

const Leaderboard: FC = () => {
  const store = useLeaderboardStore()
  const authStore = useAuthStore()

  const [data, setData] = useState<any[]>([])

  const initialize = () => {
    store.getAction((newData) => {
      console.log(newData)
      setData(newData)
    })
  }

  const createUserAvatar = (first_name: string, last_name: string) => {
    const avatar = createAvatar(initials, {
      seed: `${first_name ?? ""} ${last_name ?? ""}`,
      radius: 50,
      fontFamily: ["Manrope"],
      fontWeight: 600
    })
    return avatar
  }

  useEffect(() => {
    initialize()
  }, [])

  return (
    <PageLayout>
      <section className="relative mb-4">
        <ImagePlaceholder
          className="w-full"
          src="images/leaderboard-bg.svg"
          alt="Background"
          w={375}
          h={215}
          borderRadius="rounded-t-[30px]"
        />

        <button className="absolute right-4 top-4 flex items-center gap-1 rounded-xl p-1 hover:bg-[rgba(255,255,255,0.2)]">
          <IoIosInformationCircleOutline className="text-base text-white" />
          <span className="text-xs font-bold text-white">Notice</span>
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-[linear-gradient(_#0C0A0C00_0%,_#0C0A0C61_23%,_#0C0A0CCC_82%,_#0C0A0CFF_100%)]" />

        <div className="absolute bottom-10 left-0 right-0 text-center text-2xl font-semibold text-white">
          Leaderboard
        </div>

        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 text-center text-sm font-medium text-[#5E5E5E]">
          <RiGlobalLine className="text-xl" />
          Worldwide
        </div>
      </section>

      <section className="mb-6 flex flex-col px-10 text-white">
        <div className="mb-1 flex items-center justify-center text-base font-bold">
          {(`${data?.[0]?.tg_first_name ?? ""} ${data?.[0]?.tg_last_name ?? ""}`) ?? "Soon"}
        </div>

        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
            {(`${data?.[1]?.tg_first_name ?? ""} ${data?.[1]?.tg_last_name ?? ""}`) ?? "Soon"}
          </span>
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-right">
            {(`${data?.[2]?.tg_first_name ?? ""} ${data?.[2]?.tg_last_name ?? ""}`) ?? "Soon"}
          </span>
        </div>
      </section>

      <section className="flex flex-1 flex-col rounded-3xl bg-[#141114]">
        <div className="grid h-full grid-cols-[50px_50px_1fr_50px] items-center px-5 py-4">
          <div className="text-xs font-bold text-white">Rank</div>
          <div></div>
          <div className="text-xs font-bold text-white">Name</div>
          <div className="text-right text-xs font-bold text-white">MGT</div>
        </div>
        <div className="col-span-4 h-[1px] w-full border-t border-[#4F4F4F66]" />
        <div className="grid h-full grid-cols-[50px_50px_1fr_50px] items-center py-4">
          {data?.map((d, index) => (
            <div
              key={d.rank}
              className={clsx("col-span-4 grid grid-cols-[50px_50px_1fr_50px] items-center mb-2 px-5 py-2", (index > 0 && d.id === authStore.user?.id) ? "shadow-inner shadow-gray-100/30" : "")}
            >
              <div
                className={clsx(
                  "flex items-center justify-between",
                  index < 5 ? "text-[#C79BFF]" : "text-white"
                )}
              >
                <span className="text-xs font-bold">{d.rank}</span>

              </div>
              <div>
                {d.tg_avatar ? (
                  <img
                    className="h-8 w-8 !rounded-full"
                    src={d.tg_avatar}
                    alt={d.tg_username}
                  />
                ) : (
                  <div className="h-8 w-8" dangerouslySetInnerHTML={{ __html: createUserAvatar(d.tg_first_name, d.tg_last_name) ?? "" }} />
                )}

              </div>
              <div
                className={clsx(
                  "w-full overflow-hidden text-ellipsis whitespace-nowrap px-1 text-xs font-bold",
                  index < 5 ? "text-[#C79BFF]" : "text-white"
                )}
              >
                {`${d.tg_first_name ?? ""} ${d.tg_last_name ?? ""}`}
              </div>
              <div
                className={clsx(
                  "text-right text-xs font-bold",
                  index < 5 ? "text-[#C79BFF]" : "text-white"
                )}
              >
                {d.score}
              </div>
            </div>
          ))}
        </div>

        {data?.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-xs font-bold text-white">
            Coming Soon...
          </div>
        )}
      </section>
      {
        authStore.user?.rank > 5 && (
          <section className="fixed w-full bottom-[23%] z-[1001] bg-[#141114] px-5 py-2 rounded-md shadow-inner shadow-gray-100/20">
            <div
              className="col-span-4 grid grid-cols-[50px_50px_1fr_50px] items-center"
            >
              <div
                className={clsx(
                  "flex items-center justify-between",
                  authStore.user?.rank < 6 ? "text-[#C79BFF]" : "text-white"
                )}
              >
                <span className="text-xs font-bold">{authStore.user?.rank}</span>

              </div>
              <div>
                {authStore.user?.tg_avatar ? (
                  <img
                    className="h-8 w-8 !rounded-full"
                    src={authStore.user?.tg_avatar}
                    alt={authStore.user?.tg_username}
                  />
                ) : (
                  <div className="h-8 w-8" dangerouslySetInnerHTML={{ __html: createUserAvatar(authStore.user?.tg_first_name, authStore.user?.tg_last_name) ?? "" }} />
                )}
              </div>
              <div
                className={clsx(
                  "w-full overflow-hidden text-ellipsis whitespace-nowrap px-1 text-xs font-bold",
                  authStore.user?.rank < 6 ? "text-[#C79BFF]" : "text-white"
                )}
              >
                {`${authStore.user?.tg_first_name ?? ""} ${authStore.user?.tg_last_name ?? ""}`}
              </div>
              <div
                className={clsx(
                  "text-right text-xs font-bold",
                  authStore.user?.rank < 6 ? "text-[#C79BFF]" : "text-white"
                )}
              >
                {authStore.user?.score}
              </div>
            </div>
          </section>
        )
      }
    </PageLayout>
  )
}

export default Leaderboard
