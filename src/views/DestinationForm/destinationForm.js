import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLocationPin } from '@coreui/icons'
import axiosInstance from '../../core/axiosInstance'
import './destinationForm.css'

const DestinationForm = () => {
  // State untuk form data
  const [formData, setFormData] = useState({
    name: '',
    posibility_day: '',
    car_destination_price: [],
  })

  // State untuk car types dari API
  const [carTypes, setCarTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch car types saat komponen mount
  useEffect(() => {
    fetchCarTypes()
  }, [])

  const fetchCarTypes = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('🚗 Mengambil data car types...')
      const response = await axiosInstance.get('/api/get-car-types')

      console.log('✅ Response car types:', response.data)

      if (response.data.success) {
        setCarTypes(response.data.data)

        // Langsung inisialisasi car_destination_price dengan semua car types
        const initialCarPrices = response.data.data.map((car) => ({
          car_type_id: car.id,
          price: '',
        }))

        setFormData((prev) => ({
          ...prev,
          car_destination_price: initialCarPrices,
        }))

        console.log('📋 Car types berhasil dimuat:', response.data.data.length, 'items')
        console.log('🔄 Car destination prices diinisialisasi untuk semua car types')
      } else {
        setError('Gagal mengambil data car types')
      }
    } catch (err) {
      console.error('❌ Error fetching car types:', err)
      setError('Gagal mengambil data car types: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Handle input change untuk form utama
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle change untuk car destination price
  const handleCarPriceChange = (carTypeId, price) => {
    setFormData((prev) => ({
      ...prev,
      car_destination_price: prev.car_destination_price.map((item) =>
        item.car_type_id === carTypeId ? { ...item, price: price } : item,
      ),
    }))
  }

  // Get car name by id
  const getCarNameById = (carId) => {
    const car = carTypes.find((car) => car.id === parseInt(carId))
    return car ? car.car_name : 'Unknown Car'
  }

  // Validasi form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nama destinasi harus diisi')
      return false
    }

    if (!formData.posibility_day || formData.posibility_day <= 0) {
      setError('Jumlah hari harus diisi dan lebih dari 0')
      return false
    }

    // Cek apakah ada minimal satu price yang diisi
    const filledPrices = formData.car_destination_price.filter(
      (item) => item.price && item.price > 0,
    )
    if (filledPrices.length === 0) {
      setError('Minimal harus ada satu car type yang diisi harganya')
      return false
    }

    return true
  }

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      // Filter hanya car types yang memiliki price
      const filledCarPrices = formData.car_destination_price
        .filter((item) => item.price && item.price > 0)
        .map((item) => ({
          car_type_id: parseInt(item.car_type_id),
          price: parseInt(item.price),
        }))

      // Format data sesuai spesifikasi
      const submitData = {
        name: formData.name.trim(),
        posibility_day: parseInt(formData.posibility_day),
        car_destination_price: filledCarPrices,
      }

      const response = await axiosInstance.post('/api/destination', submitData)
      console.log('✅ Response:', response.data)

      // Simulasi submit berhasil
      setSuccess('Destination berhasil dibuat!')

      // Reset form
      setFormData({
        name: '',
        posibility_day: '',
        car_destination_price: carTypes.map((car) => ({
          car_type_id: car.id,
          price: '',
        })),
      })

      console.log('✅ Destination berhasil dibuat')
    } catch (err) {
      console.error('❌ Error submitting destination:', err)
      setError('Gagal membuat destination: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex align-items-center">
              <CIcon icon={cilLocationPin} className="me-2" />
              <strong>Form Destination</strong>
            </div>
          </CCardHeader>
          <CCardBody>
            {/* Alert untuk error dan success */}
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError('')}>
                {error}
              </CAlert>
            )}

            {success && (
              <CAlert color="success" dismissible onClose={() => setSuccess('')}>
                {success}
              </CAlert>
            )}

            {/* Loading state untuk car types */}
            {loading && (
              <div className="text-center mb-3">
                <CSpinner color="primary" />
                <p className="mt-2">Memuat data car types...</p>
              </div>
            )}

            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="name">Nama Destinasi *</CFormLabel>
                  <CFormInput
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama destinasi"
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="posibility_day">Jumlah Hari *</CFormLabel>
                  <CFormInput
                    type="number"
                    id="posibility_day"
                    name="posibility_day"
                    value={formData.posibility_day}
                    onChange={handleInputChange}
                    placeholder="Masukkan jumlah hari"
                    min="1"
                    required
                  />
                </CCol>
              </CRow>

              {/* Car Destination Price Section */}
              <div className="mb-4">
                <div className="mb-3">
                  <h5>Car Destination Price</h5>
                  <small className="text-muted">
                    Isi harga untuk car type yang ingin ditambahkan. Kosongkan jika tidak ingin
                    menambahkan car type tersebut.
                  </small>
                </div>

                {carTypes.length === 0 && !loading ? (
                  <CAlert color="warning">Tidak ada car types tersedia.</CAlert>
                ) : (
                  <CTable striped hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Car Type</CTableHeaderCell>
                        <CTableHeaderCell>Kapasitas</CTableHeaderCell>
                        <CTableHeaderCell>Harga Destination</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {carTypes.map((car) => {
                        const carPrice = formData.car_destination_price.find(
                          (item) => item.car_type_id === car.id,
                        )

                        return (
                          <CTableRow key={car.id}>
                            <CTableDataCell>
                              <strong>{car.car_name}</strong>
                              <br />
                              <small className="text-muted">{car.description}</small>
                            </CTableDataCell>
                            <CTableDataCell>
                              <span className="badge bg-info">{car.capacity} orang</span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CInputGroup>
                                <CInputGroupText>Rp</CInputGroupText>
                                <CFormInput
                                  type="number"
                                  value={carPrice?.price || ''}
                                  onChange={(e) => handleCarPriceChange(car.id, e.target.value)}
                                  placeholder="Masukkan harga destination"
                                  min="0"
                                />
                              </CInputGroup>
                            </CTableDataCell>
                          </CTableRow>
                        )
                      })}
                    </CTableBody>
                  </CTable>
                )}
              </div>

              {/* Submit Button */}
              <div className="d-flex justify-content-end">
                <CButton type="submit" color="primary" disabled={submitting || loading}>
                  {submitting ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Destination'
                  )}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DestinationForm
