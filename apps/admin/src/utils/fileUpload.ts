import axios from "axios"

export const uploadImage = async (file: File, callback?: Function) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    axios({
      url: `${import.meta.env.VITE_API_URL}/image-upload`,
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data' },
      data: formData,
    })
      .then((res) => {
        console.log(res.data)
        if (res.status === 200 || res.status === 201) {
          if (callback) callback(res.data.url)
        }
      })
      .catch((err) => {
        console.error(err)
        return null
      })
      .finally()
  } catch (e) {
    console.error(e)
    if (callback) callback(null)
  }
}

export const removeImage = async (oldImageName: string, callback?: Function) => {
  try {
    axios({
      url: `${import.meta.env.VITE_API_URL}/image-remove`,
      method: 'POST',
      data: {oldImage: oldImageName},
    })
      .then((res) => {
        console.log(res.data)
        if (res.status === 200 || res.status === 201) {
          if (callback) callback()
        }
      })
      .catch((err) => {
        console.error(err)
        return null
      })
      .finally()
  } catch (e) {
    console.error(e)
    return null
  }
}