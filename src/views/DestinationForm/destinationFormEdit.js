import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import { cilLocationPin, cilPencil } from '@coreui/icons'
import axiosInstance from '../../core/axiosInstance'
import './destinationForm.css'

const DestinationFormEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // State untuk form data
  const [formData, setFormData] = useState({
    name: '',
    posibility_day: '',
    car_destination_price: [],
  })

  // State untuk car types dari API
  const [carTypes, setCarTypes] = useState([])
  const [destinationData, setDestinationData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch data saat komponen mount
  useEffect(() => {
    if (id) {
      fetchDestinationData()
      fetchCarTypes()
    }
  }, [id])

  const fetchDestinationData = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('📍 Mengambil data destination dengan ID:', id)
      const response = await axiosInstance.get(`/api/destination/${id}`)

      console.log('✅ Response destination data:', response.data)

      if (response.data.success) {
        const destination = response.data.data.data
        setDestinationData(destination)

        // Set form data dari destination yang ada
        setFormData({
          name: destination.name,
          posibility_day: destination.posibility_day,
          car_destination_price: destination.car_destination_prices.map((price) => ({
            car_type_id: parseInt(price.car_type_id),
            price: price.price.replace('.00', ''), // Remove .00 from price
          })),
        })

        console.log('📋 Destination data berhasil dimuat:', destination.name)
      } else {
        setError('Gagal mengambil data destination')
      }
    } catch (err) {
      console.error('❌ Error fetching destination data:', err)
      setError('Gagal mengambil data destination: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const fetchCarTypes = async () => {
    try {
      console.log('🚗 Mengambil data car types...')
      const response = await axiosInstance.get('/api/get-car-types')

      console.log('✅ Response car types:', response.data)

      if (response.data.success) {
        setCarTypes(response.data.data)
        console.log('📋 Car types berhasil dimuat:', response.data.data.length, 'items')
      } else {
        setError('Gagal mengambil data car types')
      }
    } catch (err) {
      console.error('❌ Error fetching car types:', err)
      setError('Gagal mengambil data car types: ' + (err.response?.data?.message || err.message))
    }
  }

  // Mencocokkan car types dengan destination prices yang ada
  useEffect(() => {
    if (carTypes.length > 0 && destinationData) {
      const existingPrices = formData.car_destination_price
      const updatedCarPrices = []

      carTypes.forEach((car) => {
        // Cek apakah car type ini sudah ada di destination prices
        const existingPrice = existingPrices.find((price) => price.car_type_id === car.id)

        if (existingPrice) {
          // Jika sudah ada, gunakan price yang ada
          updatedCarPrices.push(existingPrice)
        } else {
          // Jika belum ada (car type baru), tambahkan dengan price kosong
          updatedCarPrices.push({
            car_type_id: car.id,
            price: '',
          })
        }
      })

      setFormData((prev) => ({
        ...prev,
        car_destination_price: updatedCarPrices,
      }))

      console.log('🔄 Car destination prices diupdate dengan car types terbaru')
    }
  }, [carTypes, destinationData])

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

  // Cek apakah car type adalah baru (belum ada di destination asli)
  const isNewCarType = (carTypeId) => {
    if (!destinationData) return false
    return !destinationData.car_destination_prices.some(
      (price) => parseInt(price.car_type_id) === carTypeId,
    )
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

      console.log('📤 Mengirim data update:', submitData)

      const response = await axiosInstance.put(`/api/destination/${id}`, submitData)
      console.log('✅ Response update:', response.data)

      setSuccess('Destination berhasil diupdate!')

      // Redirect ke halaman manage destination setelah 2 detik
      setTimeout(() => {
        navigate('/manage-destination')
      }, 2000)

      console.log('✅ Destination berhasil diupdate')
    } catch (err) {
      console.error('❌ Error updating destination:', err)
      setError('Gagal mengupdate destination: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center">
        <CSpinner color="primary" />
        <p className="mt-2">Memuat data destination...</p>
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex align-items-center">
              <CIcon icon={cilPencil} className="me-2" />
              <strong>Edit Destination</strong>
              {destinationData && <span className="ms-2 text-muted">- {destinationData.name}</span>}
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

                {carTypes.length === 0 ? (
                  <CAlert color="warning">Tidak ada car types tersedia.</CAlert>
                ) : (
                  <CTable striped hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Car Type</CTableHeaderCell>
                        <CTableHeaderCell>Kapasitas</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Harga Destination</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {carTypes.map((car) => {
                        const carPrice = formData.car_destination_price.find(
                          (item) => item.car_type_id === car.id,
                        )
                        const isNew = isNewCarType(car.id)

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
                              {isNew ? (
                                <span className="badge bg-warning">Baru</span>
                              ) : (
                                <span className="badge bg-success">Existing</span>
                              )}
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
                              {isNew && (
                                <small className="text-warning">
                                  Car type baru - belum ada harga sebelumnya
                                </small>
                              )}
                            </CTableDataCell>
                          </CTableRow>
                        )
                      })}
                    </CTableBody>
                  </CTable>
                )}
              </div>

              {/* Submit Button */}
              <div className="d-flex justify-content-between">
                <CButton
                  color="secondary"
                  onClick={() => navigate('/manage-destination')}
                  disabled={submitting}
                >
                  Batal
                </CButton>
                <CButton type="submit" color="primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Mengupdate...
                    </>
                  ) : (
                    'Update Destination'
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

export default DestinationFormEdit
