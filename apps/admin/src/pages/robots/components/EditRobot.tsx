
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@repo/ui/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@ui/components/ui/form"
import { Input } from "@ui/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { ANIMATION_DURATION } from "@/utils/constants"
import { LoadingButton } from "@/components/_uiext"
import { LuTrash2, LuUploadCloud } from "react-icons/lu"
import { removeImage, uploadImage } from "@/utils/fileUpload"
import useRobotStore from "@/stores/useRobotStore"

type Props = {
  robot_id: number
  open: boolean
  close: () => void
}

const FormSchema = z.object({
  id: z.number(),
  image: z.string(),
  owner_type: z.string(),
  name: z.string().min(5, { message: "Must be 5 or more characters long" }),
  score: z.number().nonnegative({ message: "Must be greater than 0" }),
  level: z.number().nonnegative({ message: "Must be great than 0" }),
  price: z.string().min(1, { message: "Required" }),
})

type FormSchemaType = z.infer<typeof FormSchema>

export const EditRobot = ({ robot_id, open, close }: Props) => {

  const robotStore = useRobotStore()

  const [robot, setRobot] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tempImgSrc, setTempImgSrc] = useState('')

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
      image: "",
      owner_type: "",
      name: "",
      score: 0,
      level: 0,
      price: '',
    }
  })

  const imgInputRef = useRef<HTMLInputElement>(null)

  const onClickAddImage = useCallback(() => {
    form.setError('image', { message: '' })
    imgInputRef.current && imgInputRef.current.click()
  }, [])

  const getRobotData = useCallback(async () => {
    robotStore.getRobotById(robot_id, (res) => {
      setRobot(res)
    }, () => { })
  }, [robot_id, robotStore])

  const onSubmit = useCallback(async (values: FormSchemaType) => {

    if (tempImgSrc === '') {
      return form.setError('image', { message: 'Required' })
    }
    form.setValue('image', tempImgSrc)

    robotStore.updateRobot(form.getValues(), (res) => {
      close()
    })
  }, [robotStore, form, tempImgSrc])

  // ---------- Handlers ---------------
  const handleRemoveImage = useCallback(async () => {
    if (tempImgSrc === robot?.image) {
      setLoading(false)
      return setTempImgSrc('')
    }
    setLoading(true)
    const splitedTempImgSrc = tempImgSrc.split('/')

    if (splitedTempImgSrc.length === 0) return
    const tempImgName = splitedTempImgSrc[splitedTempImgSrc.length - 1]

    await removeImage(tempImgName, () => {
      setLoading(false)
      setTempImgSrc('')
    })
  }, [form, robot, tempImgSrc])

  const handleUploadNewImage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (
      e.currentTarget &&
      e.currentTarget.files &&
      e.currentTarget.files.length > 0
    ) {
      const file = e.currentTarget.files[0]

      if (file && /^image\//.test(file.type)) {
        setLoading(true)
        uploadImage(file, (res: string) => {
          setLoading(false)
          setTempImgSrc(res)
          form.setValue('image', res)
          if (imgInputRef.current) imgInputRef.current.value = ''
        })
      }
    }
  }, [imgInputRef])

  // ---------- useEffect ---------------
  useEffect(() => {
    setRobot(null)
    setTempImgSrc('')
    form.reset({
      id: -1,
      image: "",
      owner_type: "platform",
      name: "",
      score: 0,
      level: 0,
      price: '',
    })
    if (robot_id > -1)
      getRobotData()
  }, [open])

  useEffect(() => {
    if (robot) {
      const imageUrl = robot.image
      form.setValue('image', imageUrl)
      form.setValue('id', robot.id)
      form.setValue('owner_type', robot.owner_type)
      form.setValue('name', robot.name)
      form.setValue('score', robot.score)
      form.setValue('level', robot.level)
      form.setValue('price', robot.price)
      setTempImgSrc(imageUrl)
    }
  }, [robot])

  // ----------- Customized components ----------
  const CustomizedRobotImage = () => {
    return (
      <div className="flex">
        {(tempImgSrc !== '') ? (
          <div className="relative w-fit h-fit z-1 m-auto group">
            <FormField
              control={form.control}
              name="image"
              disabled={loading}
              render={({ field }) => (
                <FormItem>
                  <img
                    className="m-auto rounded-2xl max-w-[165px]"
                    src={`${import.meta.env.VITE_API_URL}/static/${tempImgSrc}`}
                    alt={robot?.name}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='absolute w-full bg-gray-500/80 opacity-0 bottom-0 p-5 rounded-br-2xl rounded-bl-2xl group-hover:opacity-100 duration-300'>
              <LuTrash2 className="m-auto text-white" onClick={handleRemoveImage} />
            </div>
            {loading && (
              <div className='absolute w-full h-full bg-gray-500/80 opacity-1 top-0 text-white'>
                <span className="w-full h-full flex justify-center items-center">Loading...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex border-2 rounded-sm w-[165px] h-[165px] m-auto">
            <FormField
              control={form.control}
              name="image"
              disabled={loading}
              render={({ field }) => (
                <FormItem className="m-auto cursor-pointer" onClick={onClickAddImage}>
                  <LuUploadCloud />
                  <FormMessage />
                </FormItem>
              )}
            />
            {loading && (
              <div className='absolute w-full h-full bg-gray-500/80 opacity-1 top-0 z-10 text-white'>
                <span className="w-full h-full flex justify-center items-center">Loading...</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogOverlay>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>
              {robot_id > -1 ? 'Edit a Robot' : 'Add a New Robot'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex w-full flex-col">
            <input
              id='projectLogo'
              type='file'
              accept='image/*'
              ref={imgInputRef}
              style={{ display: 'none' }}
              onChange={handleUploadNewImage}
            />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-1 flex-col justify-center"
              >
                <CustomizedRobotImage />
                <motion.div
                  custom={1}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  className="mt-4 mb-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="owner_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Owner Type</FormLabel>
                        <Input autoComplete="off" type="text" {...field} readOnly />
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
                  className="mb-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Robot Name</FormLabel>
                        <Input autoFocus autoComplete="off" type="text" {...field} />
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
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Score</FormLabel>
                        <Input autoComplete="off" type="number" min={0} {...field} onChange={(e) => form.setValue('score', Number(e.target.value))} />
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
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Level</FormLabel>
                        <Input autoComplete="off" type="number" min={0} {...field} onChange={(e) => form.setValue('level', Number(e.target.value))} />
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
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Price</FormLabel>
                        <Input autoComplete="off" type="number" min={0} step="any" {...field} />
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
                  className="w-full"
                >
                  <LoadingButton type="submit" loading={robotStore.loading}>
                    {robot_id > -1 ? 'Update' : 'Add'}
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