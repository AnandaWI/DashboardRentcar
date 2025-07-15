import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CButton,
} from '@coreui/react'
import { useParams } from 'react-router-dom'
import axiosInstance from '../../core/axiosInstance'
import './carform.css'
import supabaseService from '../../core/supabaseService'

const CarShow = () => {
  const { id } = useParams()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    car_name: '',
    category_id: '',
    capacity: '',
    rent_price: '',
    description: '',
    feature: [],
    img_url: [],
  })

  // Ref untuk file input
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)]
  const [imagePreviews, setImagePreviews] = useState([null, null, null])

  useEffect(() => {
    fetchCar()
  }, [id])

  const fetchCar = async () => {
    try {
      const response = await axiosInstance.get(`/api/car-types/${id}`)
      const carData = response.data.data
      setCar(carData)
      setFormData({
        car_name: carData.car_name,
        category_id: carData.category_id,
        capacity: carData.capacity,
        rent_price: carData.rent_price,
        description: carData.description,
        feature: carData.features.map((f) => f.feature),
        img_url: carData.images.map((img) => img.img_url),
      })
      // Set image previews
      setImagePreviews(carData.images.map((img) => img.img_url))
    } catch (error) {
      console.error('Error fetching car:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.feature]
    newFeatures[index] = value
    setFormData({
      ...formData,
      feature: newFeatures,
    })
  }

  // Handler untuk perubahan file gambar
  const handleImageChange = (e, index) => {
    const file = e.target.files[0]
    if (file) {
      const newPreviews = [...imagePreviews]
      newPreviews[index] = URL.createObjectURL(file)
      setImagePreviews(newPreviews)
    }
  }

  // Memicu klik pada file input yang tersembunyi
  const handlePlaceholderClick = (index) => {
    if (isEditing) {
      fileInputRefs[index].current.click()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const imgUrlArray = [...formData.img_url] // Salin URL gambar yang ada

      // Loop untuk upload gambar baru
      for (let i = 0; i < fileInputRefs.length; i++) {
        const fileInput = fileInputRefs[i].current
        if (fileInput && fileInput.files[0]) {
          const uploadedPath = await supabaseService.upload('cars', fileInput.files[0])
          const publicUrl = supabaseService.getPublicUrl(uploadedPath)
          imgUrlArray[i] = publicUrl // Update URL gambar jika ada file baru
        }
      }

      const finalData = {
        ...formData,
        img_url: imgUrlArray,
      }

      await axiosInstance.put(`/api/car-types/${id}`, finalData)
      setIsEditing(false)
      fetchCar() // Refresh data after update
    } catch (error) {
      console.error('Error updating car:', error)
      alert('Gagal update mobil. Lihat console log untuk detail.')
    }
  }

  // Cleanup URL objects
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [imagePreviews])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!car) {
    return <div>Mobil tidak ditemukan</div>
  }

  return (
    <CCard>
      <CCardBody>
        <div className="d-flex justify-content-end mb-3">
          {!isEditing ? (
            <CButton color="primary" onClick={() => setIsEditing(true)}>
              Edit
            </CButton>
          ) : (
            <div className="d-flex gap-2">
              <CButton
                color="secondary"
                onClick={() => {
                  setIsEditing(false)
                  setImagePreviews(formData.img_url) // Reset preview ke URL asli
                }}
              >
                Cancel
              </CButton>
              <CButton color="primary" onClick={handleSubmit}>
                Submit
              </CButton>
            </div>
          )}
        </div>
        <CForm onSubmit={handleSubmit}>
          <CRow className="g-4">
            {/* Kolom Kiri: Gambar */}
            <CCol md={5}>
              <CRow className="g-3">
                {imagePreviews.map((url, index) => (
                  <CCol xs={12} key={index}>
                    <div
                      className="img-placeholder img-placeholder-sm"
                      style={{ backgroundImage: `url(${url})` }}
                      onClick={() => handlePlaceholderClick(index)}
                    >
                      <span>img_url[{index}]</span>
                    </div>
                    {isEditing && (
                      <CFormInput
                        type="file"
                        className="d-none"
                        ref={fileInputRefs[index]}
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, index)}
                      />
                    )}
                  </CCol>
                ))}
              </CRow>
            </CCol>

            {/* Kolom Kanan: Form Fields */}
            <CCol md={7}>
              <CFormInput
                type="text"
                name="car_name"
                placeholder="car_name"
                className="p-3 mb-3 form-control-custom"
                value={formData.car_name}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
              <CFormSelect
                name="category_id"
                className="p-3 mb-3 form-select-custom"
                value={formData.category_id}
                onChange={handleInputChange}
                disabled={!isEditing}
                options={[
                  { label: 'Regular', value: '1' },
                  { label: 'VIP', value: '2' },
                ]}
              />
              <CFormInput
                type="number"
                name="capacity"
                placeholder="capacity (number)"
                className="p-3 mb-3 form-control-custom"
                value={formData.capacity}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
              <CFormInput
                type="text"
                name="rent_price"
                placeholder="rent_price"
                className="p-3 mb-3 form-control-custom"
                value={formData.rent_price}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
              <CFormTextarea
                name="description"
                rows={4}
                placeholder="description"
                className="p-3 mb-3 form-control-custom"
                value={formData.description}
                onChange={handleInputChange}
                readOnly={!isEditing}
              ></CFormTextarea>

              {/* Bagian Feature */}
              {formData.feature.map((feature, index) => (
                <CInputGroup className="mb-3" key={index}>
                  <CFormInput
                    className="p-3 form-control-custom"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    readOnly={!isEditing}
                  />
                </CInputGroup>
              ))}
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default CarShow
