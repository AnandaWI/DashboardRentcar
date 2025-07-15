import React, { useState, useEffect } from 'react'
import CrudModal from './CrudModal'
import { useToast } from '../ToastManager'
import axiosInstance from '../../core/axiosInstance'
import supabaseDriver from '../../core/supabaseDriver'

const DriverCrudModal = (props) => {
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
            pengalaman: response.data.pengalaman,
            tgl_lahir: response.data.tgl_lahir,
            file_img_url: null,
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
    console.log('SUBMITTING:', formData)
    setSubmitting(true)

    if (!formData['data.name'] || !formData['data.pengalaman'] || !formData['data.tgl_lahir']) {
      Toast.error('Nama, Pengalaman, dan Tanggal Lahir wajib diisi.')
      setSubmitting(false)
      return
    }

    let img_url = null

    try {
      if (formData.img_url instanceof File) {
        const path = await supabaseDriver.upload('drivers', formData.img_url)
        img_url = supabaseDriver.getPublicUrl(path)
      } else if (initialData?.existingImages[0]) {
        img_url = initialData.existingImages[0]
      }

      if (!img_url) {
        Toast.error('Foto wajib ada.')
        setSubmitting(false)
        return
      }

      const payload = {
        name: formData['data.name'],
        pengalaman: formData['data.pengalaman'],
        tgl_lahir: formData['data.tgl_lahir'],
        img_url: img_url,
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
      setInitialData(null)
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

export default DriverCrudModal