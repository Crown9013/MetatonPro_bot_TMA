
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@repo/ui/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@ui/components/ui/form"
import { Input } from "@ui/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { ANIMATION_DURATION } from "@/utils/constants"
import { LoadingButton } from "@/components/_uiext"
import useRobotStore from "@/stores/useRobotStore"
import { parseRobot } from "@/utils/parseRobot"

type Props = {
  robot_id: number
  open: boolean
  close: () => void
}

const FormSchema = z.object({
  id: z.number(),
  attack: z.number(),
  'attack-speed': z.number(),
  health: z.number(),
  energy: z.number(),
  armor: z.number(),
  'energy-shield': z.number(),
})

type FormSchemaType = z.infer<typeof FormSchema>

export const EditRobotAttribute = ({ robot_id, open, close }: Props) => {

  const robotStore = useRobotStore()

  const [robot, setRobot] = useState<any>(null)

  const variants = {
    initial: {
      opacity: 0,
      y: 20
    },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * ANIMATION_DURATION,
        duration: ANIMATION_DURATION
      }
    })
  }

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: -1,
      attack: 0,
      'attack-speed': 0,
      health: 0,
      energy: 0,
      armor: 0,
      'energy-shield': 0,
    }
  })

  const getRobotData = useCallback(async () => {
    robotStore.getRobotById(robot_id, (res) => {
      setRobot(parseRobot(res))
    }, () => { })
  }, [robot_id])

  const onSubmit = async (values: FormSchemaType) => {
    robotStore.updateRobotAttribute(values, (res) => {
      close()
    })
  }

  // ---------- Handlers ---------------


  // ---------- useEffect ---------------
  useEffect(() => {
    setRobot(null)
    form.reset({
      id: -1,
      attack: 0,
      'attack-speed': 0,
      health: 0,
      energy: 0,
      armor: 0,
      'energy-shield': 0,
    })
    if (robot_id > -1)
      getRobotData()
  }, [open])

  useEffect(() => {
    if (robot_id && robot_id > -1) {
      getRobotData()
    }
  }, [robot_id])

  useEffect(() => {
    if (robot && robot.attributes) {
      form.setValue('id', robot.id)
      form.setValue('attack', Number(robot.attributes['attack']))
      form.setValue('attack-speed', Number(robot.attributes['attack-speed']))
      form.setValue('health', Number(robot.attributes['health']))
      form.setValue('energy', Number(robot.attributes['energy']))
      form.setValue('armor', Number(robot.attributes['armor']))
      form.setValue('energy-shield', Number(robot.attributes['energy-shield']))
    }
  }, [robot, robot?.attributes])

  // ----------- Customized components ----------

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogOverlay>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>
              Edit Robot
            </DialogTitle>
          </DialogHeader>
          <div className="flex w-full flex-col">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-1 flex-col justify-center"
              >
                <motion.div
                  custom={1}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  className="mb-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="armor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Armor</FormLabel>
                        <Input autoFocus autoComplete="off" type="number" min={0} step="any" {...field} onChange={(e) => form.setValue('armor', Number(e.target.value))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  custom={2}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  className="mt-4 mb-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="attack"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Attack</FormLabel>
                        <Input autoComplete="off" type="number" min={0} {...field} onChange={(e) => form.setValue('attack', Number(e.target.value))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  custom={3}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  className="mb-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="attack-speed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Attack Speed</FormLabel>
                        <Input autoComplete="off" type="number" {...field} onChange={(e) => form.setValue('attack-speed', Number(e.target.value))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  custom={4}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  className="mb-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="health"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Health</FormLabel>
                        <Input autoComplete="off" type="number" min={0} {...field} onChange={(e) => form.setValue('health', Number(e.target.value))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  custom={5}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  className="mb-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="energy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Energy</FormLabel>
                        <Input autoComplete="off" type="number" min={0} {...field} onChange={(e) => form.setValue('energy', Number(e.target.value))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  custom={6}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  className="mb-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="energy-shield"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Energy Shield</FormLabel>
                        <Input autoComplete="off" type="number" min={0} step="any" {...field} onChange={(e) => form.setValue('energy-shield', Number(e.target.value))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  custom={7}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  className="w-full"
                >
                  <LoadingButton type="submit" loading={robotStore.loading}>
                    Update
                  </LoadingButton>
                </motion.div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}