// CarForm.jsx
import React, { useState, useRef, useEffect } from 'react'
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
  CFormLabel,
} from '@coreui/react'
import './carform.css' // Impor file CSS kustom
import supabaseService from '../../core/supabaseService'
import axiosInstance from '../../core/axiosInstance'

const CarForm = () => {
  // State untuk menyimpan semua data form
  const [formData, setFormData] = useState({
    car_name: '',
    category_id: '',
    capacity: '',
    rent_price: '',
    description: '',
    feature: [],
    img_url: [],
  })

  // State terpisah untuk 'features' karena dinamis
  const [features, setFeatures] = useState(['']) // Mulai dengan satu field kosong

  // State untuk menyimpan URL preview gambar
  const [imagePreviews, setImagePreviews] = useState([null, null, null])

  // Ref untuk mengakses file input yang tersembunyi
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)]

  // Handler untuk input form standar
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handler untuk input 'feature'
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  // Handler untuk menambah field 'feature' baru
  const addFeatureField = () => {
    setFeatures([...features, ''])
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
    fileInputRefs[index].current.click()
  }

  // Membersihkan object URL untuk mencegah memory leak
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [imagePreviews])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const imgUrlArray = []

      // Loop untuk upload ketiga gambar
      for (let i = 0; i < fileInputRefs.length; i++) {
        const fileInput = fileInputRefs[i].current
        if (fileInput && fileInput.files[0]) {
          const uploadedPath = await supabaseService.upload('cars', fileInput.files[0])
          const publicUrl = supabaseService.getPublicUrl(uploadedPath)
          imgUrlArray.push(publicUrl)
        }
      }

      const finalData = {
        ...formData,
        img_url: imgUrlArray,
        feature: features.filter((f) => f.trim() !== ''),
      }

      await axiosInstance.post('/api/car-types', finalData)

      // Jika ingin reset form setelah submit:
      setFormData({
        car_name: '',
        category_id: '',
        capacity: '',
        rent_price: '',
        description: '',
        feature: [],
        img_url: [],
      })
      setFeatures([''])
      setImagePreviews([null, null, null])
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal upload gambar. Lihat console log untuk detail.')
    }
  }

  return (
    <CCard>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CRow className="g-4">
            {/* Kolom Kiri: Input Gambar */}
            <CCol md={5}>
              <CRow className="g-3">
                <CCol xs={12}>
                  <div
                    className="img-placeholder img-placeholder-sm"
                    style={{ backgroundImage: `url(${imagePreviews[0]})` }}
                    onClick={() => handlePlaceholderClick(0)}
                  >
                    {!imagePreviews[1] && <span>Gambar 1</span>}
                  </div>
                  <CFormInput
                    type="file"
                    className="d-none"
                    ref={fileInputRefs[0]}
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 0)}
                  />
                </CCol>

                <CCol xs={12}>
                  <div
                    className="img-placeholder img-placeholder-sm"
                    style={{ backgroundImage: `url(${imagePreviews[1]})` }}
                    onClick={() => handlePlaceholderClick(1)}
                  >
                    {!imagePreviews[1] && <span>Gambar 2</span>}
                  </div>
                  <CFormInput
                    type="file"
                    className="d-none"
                    ref={fileInputRefs[1]}
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 1)}
                  />
                </CCol>
                <CCol xs={12}>
                  <div
                    className="img-placeholder img-placeholder-sm"
                    style={{ backgroundImage: `url(${imagePreviews[2]})` }}
                    onClick={() => handlePlaceholderClick(2)}
                  >
                    {!imagePreviews[2] && <span>Gambar 3</span>}
                  </div>
                  <CFormInput
                    type="file"
                    className="d-none"
                    ref={fileInputRefs[2]}
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 2)}
                  />
                </CCol>
              </CRow>
            </CCol>

            {/* Kolom Kanan: Form Fields */}
            <CCol md={7}>
              <CFormInput
                type="text"
                name="car_name"
                placeholder="Merk Mobil"
                className="p-3 mb-3 form-control-custom"
                value={formData.car_name}
                onChange={handleFormChange}
              />
              <CFormSelect
                name="category_id"
                className="p-3 mb-3 form-select-custom"
                value={formData.category_id}
                onChange={handleFormChange}
                options={[
                  {
                    label: 'Kategori',
                    value: '',
                    disabled: true,
                  },
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
                onChange={handleFormChange}
              />
              <CFormInput
                type="text"
                name="rent_price"
                placeholder="Harga"
                className="p-3 mb-3 form-control-custom"
                value={formData.rent_price}
                onChange={handleFormChange}
              />
              <CFormTextarea
                name="description"
                rows={4}
                placeholder="Deskripsi"
                className="p-3 mb-3 form-control-custom"
                value={formData.description}
                onChange={handleFormChange}
              ></CFormTextarea>

              {/* Bagian Feature Dinamis */}
              {features.map((feature, index) => (
                <CInputGroup className="mb-3" key={index}>
                  <CFormInput
                    className="p-3 form-control-custom"
                    placeholder="Fasilitas"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  {/* Tampilkan tombol '+' hanya di baris terakhir */}
                  {index === features.length - 1 && (
                    <CButton type="button" className="btn-primary px-3" onClick={addFeatureField}>
                      +
                    </CButton>
                  )}
                </CInputGroup>
              ))}

              <div className="d-grid mt-4">
                <CButton type="submit" className="btn-primary p-3">
                  Tambah
                </CButton>
              </div>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default CarForm
