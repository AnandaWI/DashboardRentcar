import React, { useState } from 'react'
import CrudModal from './CrudModal'
import { useToast } from '../ToastManager'
import axiosInstance from '../../core/axiosInstance'
import supabaseService from '../../core/supabaseService'

const OwnerCarModal = (props) => {
  const { endpoint, onSuccess, onError, ...rest } = props
  const Toast = useToast()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (formData) => {
    setSubmitting(true)

    if (!formData.name || !formData.description) {
      Toast.error('Name dan Description wajib diisi.')
      setSubmitting(false)
      return
    }

    if (!(formData.file_apk instanceof File) && !formData.file_apk) {
      Toast.error('File APK wajib diunggah.')
      setSubmitting(false)
      return
    }

    if (!(formData.file_ipa instanceof File) && !formData.file_ipa) {
      Toast.error('File IPA wajib diunggah.')
      setSubmitting(false)
      return
    }

    try {
      let file_apk_url = ''
      let file_ipa_url = ''

      if (formData.file_apk instanceof File) {
        const path = await supabaseService.upload('app_history/apk', formData.file_apk)
        file_apk_url = supabaseService.getPublicUrl(path)
        console.log('Uploaded APK URL:', file_apk_url)
      } else {
        file_apk_url = formData.file_apk || ''
      }

      if (formData.file_ipa instanceof File) {
        const path = await supabaseService.upload('app_history/ipa', formData.file_ipa)
        file_ipa_url = supabaseService.getPublicUrl(path)
        console.log('Uploaded IPA URL:', file_ipa_url)
      } else {
        file_ipa_url = formData.file_ipa || ''
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        file_apk: file_apk_url,
        file_ipa: file_ipa_url,
      }

      console.log('Payload untuk submit:', payload)

      if (props.mode === 'edit') {
        await axiosInstance.put(`${endpoint}/${props.id}`, payload)
      } else {
        await axiosInstance.post(endpoint, payload)
      }

      onSuccess?.()
      props.onClose()
    } catch (err) {
      console.error('Submit error:', err)
      const message = err?.message || 'Terjadi kesalahan saat submit'
      Toast.error(message)
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
        console.log(`File selected for ${name}:`, file)
        setFormData((prev) => ({
          ...prev,
          [name]: file,
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  return (
    <CrudModal
      {...rest}
      endpoint={endpoint}
      onSuccess={onSuccess}
      onError={onError}
      isSubmit={submitting}
      customHandleSubmit={handleSubmit}
      customHandleChange={customHandleChange}
    />
  )
}

export default OwnerCarModal
