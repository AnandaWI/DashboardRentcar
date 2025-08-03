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

  // State terpisah untuk features seperti di CarForm
  const [features, setFeatures] = useState([''])

  // Ref untuk file input
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)]
  const [imagePreviews, setImagePreviews] = useState([null, null, null])
  const [originalImageUrls, setOriginalImageUrls] = useState([null, null, null])

  useEffect(() => {
    fetchCar()
  }, [id])

  const fetchCar = async () => {
    try {
      const response = await axiosInstance.get(`/api/car-types/${id}`)
      const carData = response.data.data

      setCar(carData)

      // Extract features dari response
      const extractedFeatures = carData.features?.map((f) => f.feature) || []

      // Pastikan minimal ada satu field kosong untuk editing
      const featuresForState = extractedFeatures.length > 0 ? extractedFeatures : ['']

      const newFormData = {
        car_name: carData.car_name || '',
        category_id: carData.category_id || '',
        capacity: carData.capacity || '',
        rent_price: carData.rent_price || '',
        description: carData.description || '',
        feature: extractedFeatures,
        img_url: carData.images?.map((img) => img.img_url) || [],
      }

      setFormData(newFormData)
      setFeatures(featuresForState)

      // Set image previews - pastikan ada 3 slot
      const imageUrls = carData.images?.map((img) => img.img_url) || []

      const paddedImageUrls = [...imageUrls]
      while (paddedImageUrls.length < 3) {
        paddedImageUrls.push(null)
      }
      const finalImageUrls = paddedImageUrls.slice(0, 3)

      setImagePreviews(finalImageUrls)
      setOriginalImageUrls(finalImageUrls)
    } catch (error) {
      console.error('Error fetching car:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    const newFormData = {
      ...formData,
      [name]: value,
    }
    setFormData(newFormData)
  }

  // Handler untuk input 'feature' - menggunakan state features terpisah
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features]
    newFeatures[index] = value

    setFeatures(newFeatures)

    // Sinkronisasi dengan formData
    const filteredFeatures = newFeatures.filter((f) => f.trim() !== '')

    setFormData({
      ...formData,
      feature: filteredFeatures,
    })
  }

  // Handler untuk menambah field 'feature' baru
  const addFeatureField = () => {
    const newFeatures = [...features, '']
    setFeatures(newFeatures)
  }

  // Handler untuk menghapus field 'feature'
  const removeFeatureField = (index) => {
    if (features.length > 1) {
      const newFeatures = features.filter((_, i) => i !== index)

      setFeatures(newFeatures)

      // Sinkronisasi dengan formData
      const filteredFeatures = newFeatures.filter((f) => f.trim() !== '')

      setFormData({
        ...formData,
        feature: filteredFeatures,
      })
    }
  }

  // Handler untuk perubahan file gambar
  const handleImageChange = (e, index) => {
    const file = e.target.files[0]

    if (file) {
      const newPreviews = [...imagePreviews]
      const blobUrl = URL.createObjectURL(file)
      newPreviews[index] = blobUrl
      setImagePreviews(newPreviews)
    }
  }

  // Handler untuk menghapus gambar
  const removeImage = (index) => {
    const newPreviews = [...imagePreviews]
    newPreviews[index] = null
    setImagePreviews(newPreviews)

    // Reset file input
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current.value = ''
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
      // Prepare image URLs array
      const imgUrlArray = []

      // Process each image slot
      for (let i = 0; i < 3; i++) {
        const fileInput = fileInputRefs[i].current
        const currentPreview = imagePreviews[i]

        // Check if there's a new file uploaded
        if (fileInput && fileInput.files[0]) {
          try {
            const uploadedPath = await supabaseService.upload('cars', fileInput.files[0])
            const publicUrl = supabaseService.getPublicUrl(uploadedPath)
            imgUrlArray.push(publicUrl)
          } catch (uploadError) {
            throw uploadError
          }
        }
        // Check if there's an existing image (not removed)
        else if (currentPreview && !currentPreview.startsWith('blob:')) {
          imgUrlArray.push(currentPreview)
        }
      }

      // Prepare final data
      const finalFeatures = features.filter((f) => f.trim() !== '')

      const finalData = {
        car_name: formData.car_name,
        category_id: formData.category_id,
        capacity: parseInt(formData.capacity) || 0,
        rent_price: formData.rent_price,
        description: formData.description,
        feature: finalFeatures,
        img_url: imgUrlArray,
      }

      const response = await axiosInstance.put(`/api/car-types/${id}`, finalData)

      setIsEditing(false)
      await fetchCar()

      alert('Data mobil berhasil diupdate!')
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      alert(`Gagal update mobil: ${errorMessage}`)
    }
  }

  // Reset form saat cancel
  const handleCancel = () => {
    setIsEditing(false)

    // Reset ke data asli dari car state
    if (car) {
      const extractedFeatures = car.features?.map((f) => f.feature) || []
      const featuresForState = extractedFeatures.length > 0 ? extractedFeatures : ['']

      const resetFormData = {
        car_name: car.car_name || '',
        category_id: car.category_id || '',
        capacity: car.capacity || '',
        rent_price: car.rent_price || '',
        description: car.description || '',
        feature: extractedFeatures,
        img_url: car.images?.map((img) => img.img_url) || [],
      }

      setFormData(resetFormData)
      setFeatures(featuresForState)

      // Reset image previews ke original
      setImagePreviews([...originalImageUrls])

      // Reset file inputs
      fileInputRefs.forEach((ref, index) => {
        if (ref.current) {
          ref.current.value = ''
        }
      })
    }
  }

  // Cleanup URL objects
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url, index) => {
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
              <CButton color="secondary" onClick={handleCancel}>
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
                    <div className="position-relative">
                      <div
                        className="img-placeholder img-placeholder-sm"
                        style={{
                          backgroundImage: url ? `url(${url})` : 'none',
                          cursor: isEditing ? 'pointer' : 'default',
                        }}
                        onClick={() => handlePlaceholderClick(index)}
                      >
                        {!url && <span>Gambar {index + 1}</span>}
                      </div>
                      {isEditing && url && (
                        <CButton
                          color="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-1"
                          onClick={() => removeImage(index)}
                          style={{ zIndex: 10 }}
                        >
                          ×
                        </CButton>
                      )}
                      {isEditing && (
                        <CFormInput
                          type="file"
                          className="d-none"
                          ref={fileInputRefs[index]}
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, index)}
                        />
                      )}
                    </div>
                  </CCol>
                ))}
              </CRow>
            </CCol>

            {/* Kolom Kanan: Form Fields */}
            <CCol md={7}>
              <CFormInput
                type="text"
                name="car_name"
                placeholder="Merk"
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
                  { label: 'VIP', value: '1' },
                  { label: 'Regular', value: '2' },
                ]}
              />
              <CFormInput
                type="number"
                name="capacity"
                placeholder="Kapasitas"
                className="p-3 mb-3 form-control-custom"
                value={formData.capacity}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
              <CFormInput
                type="text"
                name="rent_price"
                placeholder="Harga"
                className="p-3 mb-3 form-control-custom"
                value={formData.rent_price}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
              <CFormTextarea
                name="description"
                rows={4}
                placeholder="Deskripsi"
                className="p-3 mb-3 form-control-custom"
                value={formData.description}
                onChange={handleInputChange}
                readOnly={!isEditing}
              ></CFormTextarea>

              {/* Bagian Feature Dinamis */}
              {features.map((feature, index) => (
                <CInputGroup className="mb-3" key={index}>
                  <CFormInput
                    className="p-3 form-control-custom"
                    placeholder="Fasilitas"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    readOnly={!isEditing}
                  />
                  {isEditing && (
                    <>
                      {/* Tampilkan tombol '+' hanya di baris terakhir */}
                      {index === features.length - 1 && (
                        <CButton
                          type="button"
                          className="btn-primary px-3"
                          onClick={addFeatureField}
                        >
                          +
                        </CButton>
                      )}
                      {/* Tampilkan tombol '-' jika ada lebih dari 1 feature */}
                      {features.length > 1 && (
                        <CButton
                          type="button"
                          color="danger"
                          className="px-3"
                          onClick={() => removeFeatureField(index)}
                        >
                          -
                        </CButton>
                      )}
                    </>
                  )}
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
