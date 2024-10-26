
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
import useWeaponStore from "@/stores/useWeaponStore"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@ui/components/ui/select"

type Props = {
  weapon_id: number
  open: boolean
  close: () => void
}

const FormSchema = z.object({
  id: z.number(),
  image: z.string(),
  owner_type: z.string(),
  name: z.string().min(5, { message: "Must be 5 or more characters long" }),
  type: z.string().min(1, { message: "Required" }),
  price: z.string().min(1, { message: "Required" }),
})

type FormSchemaType = z.infer<typeof FormSchema>

export const EditWeapon = ({ weapon_id, open, close }: Props) => {

  const weaponStore = useWeaponStore()

  const [weapon, setWeapon] = useState<any>(null)
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
      type: "",
      price: '',
    }
  })

  const imgInputRef = useRef<HTMLInputElement>(null)

  const onClickAddImage = useCallback(() => {
    form.setError('image', { message: '' })
    imgInputRef.current && imgInputRef.current.click()
  }, [])

  const getWeaponData = useCallback(async () => {
    weaponStore.getWeaponById(weapon_id, (res) => {
      setWeapon(res)
    }, () => { })
  }, [weapon_id, weaponStore])

  const onSubmit = useCallback(async (values: FormSchemaType) => {

    if (tempImgSrc === '') {
      return form.setError('image', { message: 'Required' })
    }
    form.setValue('image', tempImgSrc)

    weaponStore.updateWeapon(form.getValues(), (res) => {
      console.log(res)
      close()
    })
  }, [weaponStore, form, tempImgSrc])

  // ---------- Handlers ---------------
  const handleRemoveImage = useCallback(async () => {
    if (tempImgSrc === weapon?.image) {
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
  }, [form, weapon, tempImgSrc])

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
    setWeapon(null)
    setTempImgSrc('')
    form.reset({
      id: -1,
      image: "",
      owner_type: "platform",
      name: "",
      type: "",
      price: '',
    })
    if (weapon_id > -1)
      getWeaponData()
  }, [open])

  useEffect(() => {
    if (weapon) {
      const imageUrl = weapon.image
      form.setValue('image', imageUrl)
      form.setValue('id', weapon.id)
      form.setValue('owner_type', weapon.owner_type)
      form.setValue('name', weapon.name)
      form.setValue('type', weapon.type)
      form.setValue('price', weapon.price)
      setTempImgSrc(imageUrl)
    }
  }, [weapon])

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
                    alt={weapon?.name}
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
              {weapon_id > -1 ? 'Edit a Weapon' : 'Add a New Weapon'}
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
                        <Select onValueChange={(e) => form.setValue('owner_type', e)} defaultValue={field.value} {...field}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Owner Types</SelectLabel>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="platform">Platform</SelectItem>
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-main text-sm font-normal">Score</FormLabel>
                        <Input autoFocus autoComplete="off" type="text" {...field} />
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
                  <LoadingButton type="submit" loading={weaponStore.loading}>
                    {weapon_id > -1 ? 'Update' : 'Add'}
                  </LoadingButton>
                </motion.div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog >
  )
}