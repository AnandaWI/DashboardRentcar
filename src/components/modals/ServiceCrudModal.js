import React, { useState, useEffect } from 'react'
import CrudModal from './CrudModal'
import { useToast } from '../ToastManager'
import axiosInstance from '../../core/axiosInstance'
import supabaseService from '../../core/supabaseService'

const ServiceCrudModal = (props) => {
  const { endpoint, mode, id, onSuccess, onError, ...rest } = props
  const Toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [initialData, setInitialData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (mode === 'edit' && id) {
        try {
          const response = await axiosInstance.get(`${endpoint}/${id}`)
          setInitialData({
            name: response.data.name,
            description: response.data.description,
            file_img_url1: null,
            file_img_url2: null,
            file_img_url3: null,
            existingImages: response.data.img_url || [],
          })
        } catch (error) {
          const msg = error?.message || 'Gagal memuat data'
          Toast.error(msg)
          onError?.(msg)
        }
      }
    }
    fetchData()
  }, [endpoint, id, mode, onError, Toast])

  const handleSubmit = async (formData) => {
    setSubmitting(true)

    if (!formData.name || !formData.description) {
      Toast.error('Name dan Description wajib diisi.')
      setSubmitting(false)
      return
    }

    let file_img_url = []

    try {
      if (formData.file_img_url1 instanceof File) {
        const path1 = await supabaseService.upload('service', formData.file_img_url1)
        file_img_url.push(supabaseService.getPublicUrl(path1))
      } else if (initialData?.existingImages[0]) {
        file_img_url.push(initialData.existingImages[0])
      }

      if (formData.file_img_url2 instanceof File) {
        const path2 = await supabaseService.upload('service', formData.file_img_url2)
        file_img_url.push(supabaseService.getPublicUrl(path2))
      } else if (initialData?.existingImages[1]) {
        file_img_url.push(initialData.existingImages[1])
      }

      if (formData.file_img_url3 instanceof File) {
        const path3 = await supabaseService.upload('service', formData.file_img_url3)
        file_img_url.push(supabaseService.getPublicUrl(path3))
      } else if (initialData?.existingImages[2]) {
        file_img_url.push(initialData.existingImages[2])
      }

      if (file_img_url.length !== 3) {
        Toast.error('Semua tiga gambar wajib ada.')
        setSubmitting(false)
        return
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        img_url: file_img_url,
      }

      if (mode === 'edit') {
        await axiosInstance.put(`${endpoint}/${id}`, payload)
      } else {
        await axiosInstance.post(endpoint, payload)
      }

      setInitialData(null)
      onSuccess?.()
      props.onClose()
    } catch (err) {
      console.error('Submit error:', err)
      const message = err?.message || 'Terjadi kesalahan saat submit'
      Toast.error(message)
      setInitialData(null) // reset
      onError?.(message)
    } finally {
      setSubmitting(false)
    }
  }

  const customHandleChange = (e, setFormData) => {
    const { name, type, value, files } = e.target

    if (type === 'file') {
      const file = files && files[0]
      if (file) {
        setFormData((prev) => ({ ...prev, [name]: file }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <CrudModal
      {...rest}
      endpoint={endpoint}
      mode={mode}
      id={id}
      initialData={initialData}
      onSuccess={onSuccess}
      onError={onError}
      isSubmit={submitting}
      customHandleSubmit={handleSubmit}
      customHandleChange={customHandleChange}
    />
  )
}

export default ServiceCrudModal
