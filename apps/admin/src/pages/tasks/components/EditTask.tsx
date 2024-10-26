import { LoadingButton } from "@/components/_uiext"
import useTaskStore from "@/stores/useTaskStore"
import { ANIMATION_DURATION } from "@/utils/constants"
import { removeImage, uploadImage } from "@/utils/fileUpload"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@ui/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@ui/components/ui/form"
import { Input } from "@ui/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@ui/components/ui/select"
import { motion } from "framer-motion"
import React from "react"
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { LuTrash2, LuUploadCloud } from "react-icons/lu"
import { z } from "zod"

type Props = {
  task_id: number
  open: boolean
  close: () => void
}

const FormSchema = z.object({
  id: z.number(),
  icon: z.string({ required_error: "Please select an icon." }),
  type: z.string({ required_error: "Please select a type of task." }).min(1, { message: 'Required' }),
  title: z.string({ required_error: "Please input a title of task." }).min(1, { message: 'Required' }),
  description: z.string({ required_error: "Please input description of task." }).min(1, { message: 'Required' }),
  action: z.string().min(1, { message: 'Required' }),
  reward: z.number({ required_error: "Please input reward amount." }).nonnegative({ message: "Must be great than 0" })
})

type FormSchemaType = z.infer<typeof FormSchema>

export const EditTask = ({ task_id, open, close }: Props) => {

  const taskStore = useTaskStore()

  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tempIconSrc, setTempIconSrc] = useState('')
  const [type, setType] = useState('')

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
      icon: "",
      type: "",
      title: "",
      description: '',
      action: '',
      reward: 0,
    }
  })

  const imgInputRef = useRef<HTMLInputElement>(null)

  const onClickAddImage = useCallback(() => {
    form.setError('icon', { message: '' })
    imgInputRef.current && imgInputRef.current.click()
  }, [])

  const getTaskData = useCallback(() => {
    taskStore.getTaskById(task_id, (res) => {
      setTask(res)
    })
  }, [task_id])

  const onSubmit = useCallback(async (values: FormSchemaType) => {
    if (tempIconSrc === '') {
      return form.setError('icon', { message: 'Required' })
    }
    if (type === 'invite' && isNaN(Number(form.getValues().action))) {
      return form.setError('action', { message: 'Must be a number' })
    }
    form.setValue('icon', tempIconSrc)

    taskStore.updateTask(form.getValues(), (res) => {
      close()
    })
  }, [taskStore, form, tempIconSrc])

  // ---------- Handlers ---------------
  const handleRemoveImage = useCallback(async () => {
    setLoading(true)
    if (tempIconSrc === task?.icon) {
      setLoading(false)
      return setTempIconSrc('')
    }
    const splitedTempImgSrc = tempIconSrc.split('/')

    if (splitedTempImgSrc.length === 0) return
    const tempImgName = splitedTempImgSrc[splitedTempImgSrc.length - 1]

    await removeImage(tempImgName, () => {
      setLoading(false)
      setTempIconSrc('')
    })
  }, [form, task, tempIconSrc])

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
          setTempIconSrc(res)
          form.setValue('icon', res)
          if (imgInputRef.current) imgInputRef.current.value = ''
        })
      }
    }
  }, [imgInputRef])

  // ---------- useEffect ---------------
  useEffect(() => {
    setTask(null)
    setTempIconSrc('')
    form.reset({
      id: -1,
      icon: "",
      type: "",
      title: "",
      description: '',
      action: '',
      reward: 0,
    })
    if (task_id > -1)
      getTaskData()
  }, [open])

  useEffect(() => {
    if (task) {
      setTempIconSrc(task.icon)
      form.setValue('id', task.id)
      form.setValue('type', task.type)
      form.setValue('title', task.title)
      form.setValue('description', task.description)
      form.setValue('reward', task.reward)
      form.setValue('action', task.action)
      form.setValue('icon', task.icon)
    }
  }, [task])

  // ----------- Customized components ----------
  const CustomizedTaskIconComponent = () => {
    return (
      <div className="flex">
        {(tempIconSrc !== '') ? (
          <div className="relative w-fit h-fit z-1 m-auto group">
            <img
              className="m-auto rounded-2xl w-[50px]"
              src={`${import.meta.env.VITE_API_URL}/static/${tempIconSrc}`}
              alt='Megaton Robot'
            />
            <div className='absolute w-full bg-gray-500/80 opacity-0 bottom-0 p-1 rounded-br-2xl rounded-bl-2xl group-hover:opacity-100 duration-300'>
              <LuTrash2 className="m-auto text-white" onClick={handleRemoveImage} />
            </div>
            {loading && (
              <div className='absolute w-full h-full bg-gray-500/80 opacity-1 top-0 text-white'>
                <span className="w-full h-full flex justify-center items-center">Loading...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex border-2 rounded-sm w-[50px] h-[50px] m-auto">
            <FormField
              control={form.control}
              name="icon"
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
              {task_id > -1 ? 'Edit a Task' : 'Add a Task'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex w-full flex-col">
            <input
              id='task_icon'
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
                <CustomizedTaskIconComponent />
                <motion.div
                  custom={1}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  className="mt-4 mb-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Type</FormLabel>
                        {/* <Input autoComplete="off" type="text" {...field} /> */}
                        <Select onValueChange={(e) => { console.log(e); setType(e); field.onChange(e) }} defaultValue={field.value} {...field}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Task Types</SelectLabel>
                              <SelectItem value="join">Join Telegram Group</SelectItem>
                              <SelectItem value="link">External Link</SelectItem>
                              <SelectItem value="invite">Invite</SelectItem>
                              <SelectItem value="wallet">Wallet</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Title</FormLabel>
                        <Input autoFocus autoComplete="off" type="text" placeholder="Input title of task" {...field} />
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Description</FormLabel>
                        <Input autoComplete="off" type="text" placeholder="+50" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                {
                  type === 'join' && (
                    <motion.div
                      custom={4}
                      initial="initial"
                      animate="animate"
                      variants={variants}
                      className="mb-4 w-full"
                    >
                      <FormField
                        control={form.control}
                        name="action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-main text-sm font-normal">Telegram Link</FormLabel>
                            <Input autoComplete="off" type="text" placeholder="https://t.me/toncoin" {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )
                }

                {
                  type === 'invite' && (
                    <motion.div
                      custom={4}
                      initial="initial"
                      animate="animate"
                      variants={variants}
                      className="mb-4 w-full"
                    >
                      <FormField
                        control={form.control}
                        name="action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-main text-sm font-normal">Invite Count</FormLabel>
                            <Input autoComplete="off" type="text" placeholder="0" {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )
                }

                {
                  type === 'link' && (
                    <motion.div
                      custom={4}
                      initial="initial"
                      animate="animate"
                      variants={variants}
                      className="mb-4 w-full"
                    >
                      <FormField
                        control={form.control}
                        name="action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-main text-sm font-normal">External Url</FormLabel>
                            <Input autoComplete="off" type="text" placeholder="https://example.com" {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )
                }

                <motion.div
                  custom={5}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  className="mb-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="reward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Reward</FormLabel>
                        <Input autoComplete="off" type="number" min={0} step="any" {...field} onChange={(e) => form.setValue('reward', Number(e.target.value))} />
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
                  <LoadingButton type="submit" loading={taskStore.loading}>
                    {task_id > -1 ? 'Update' : 'Add'}
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