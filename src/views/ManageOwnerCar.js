import {
  CButton,
  CCard,
  CCardBody,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import { PaginatedTable } from '../components'
import { useState, useEffect, useRef } from 'react'
import CrudModal from '../components/modals/CrudModal'
import EditButton from '../components/buttons/EditButton'
import DeleteButton from '../components/buttons/DeleteButton'
import { useToast } from '../components/ToastManager'
import CarCategorySelect from '../components/select/CarCategorySelect'
import CIcon from '@coreui/icons-react'
import { cilLocationPin } from '@coreui/icons'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { database } from '../core/FirebaseService'

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const ManageOwnerCar = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('store') // 'store', 'edit', 'delete'
  const [selectedId, setSelectedId] = useState(null)
  const [reload, setReload] = useState(false)

  // State untuk tracking modal
  const [trackingModalVisible, setTrackingModalVisible] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState(null)
  const [selectedCarData, setSelectedCarData] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Refs untuk map
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapContainerRef = useRef(null)
  const carRefGlobal = useRef(null)

  const Toast = useToast()

  const openModal = (mode, id = null) => {
    setModalMode(mode)
    setSelectedId(id)
    setModalVisible(true)
  }

  const handleAdd = () => openModal('store')
  const handleEdit = (id) => openModal('edit', id)
  const handleDelete = (id) => openModal('delete', id)

  // Handle tracking location
  const handleTrackLocation = (carData) => {
    console.log('🎯 Melacak lokasi mobil:', carData)
    setSelectedCarId(carData.id)
    setSelectedCarData(carData)
    setTrackingModalVisible(true)
  }

  // Initialize map when tracking modal opens
  useEffect(() => {
    if (trackingModalVisible && selectedCarId) {
      // Delay untuk memastikan modal sudah ter-render
      const timer = setTimeout(() => {
        initializeMap()
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [trackingModalVisible, selectedCarId])

  // Cleanup saat modal ditutup
  useEffect(() => {
    if (!trackingModalVisible) {
      cleanupMap()
    }
  }, [trackingModalVisible])

  const initializeMap = () => {
    console.log('🗺️ Mencoba menginisialisasi peta untuk mobil ID:', selectedCarId)

    if (!mapContainerRef.current) {
      console.error('❌ Map container tidak ditemukan')
      return
    }

    if (mapRef.current) {
      console.log('🔄 Map sudah ada, membersihkan terlebih dahulu')
      cleanupMap()
    }

    try {
      console.log('🗺️ Menginisialisasi peta baru...')

      // Initialize map
      mapRef.current = L.map(mapContainerRef.current, {
        center: [-2.5489, 118.0149],
        zoom: 5,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      setMapLoaded(true)
      console.log('✅ Peta berhasil diinisialisasi')

      // Setup Firebase listener
      setupFirebaseListener()
    } catch (error) {
      console.error('❌ Error saat menginisialisasi peta:', error)
    }
  }

  const setupFirebaseListener = () => {
    if (!selectedCarId) return

    console.log('🔥 Mengatur Firebase listener untuk mobil ID:', selectedCarId)

    // Reference ke Firebase untuk mobil yang dipilih
    const carRef = database.ref(`owner_car/${selectedCarId}`)
    carRefGlobal.current = carRef

    // Set status = "1" untuk mulai tracking
    carRef
      .update({ status: '1' })
      .then(() => {
        console.log('🚀 Status tracking berhasil diatur ke aktif untuk mobil ID:', selectedCarId)
      })
      .catch((error) => {
        console.error('❌ Error setting status:', error)
      })

    // Watch for changes
    carRef.on(
      'value',
      (snapshot) => {
        const data = snapshot.val()
        console.log('📡 Data diterima dari Firebase untuk mobil ID:', selectedCarId, data)

        if (data && data.status === '1') {
          console.log('🟢 Status tracking aktif')

          const lat = parseFloat(data.latitude)
          const lon = parseFloat(data.longitude)

          console.log('📊 Parsing koordinat - lat:', lat, 'lon:', lon)

          if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
            const latLng = [lat, lon]
            console.log('📍 Koordinat valid diterima:', latLng)

            if (mapRef.current) {
              if (!markerRef.current) {
                markerRef.current = L.marker(latLng)
                  .addTo(mapRef.current)
                  .bindPopup(`Posisi ${selectedCarData?.plate_number || 'Kendaraan'} Saat Ini.`)
                  .openPopup()
                mapRef.current.setView(latLng, 15)
                console.log('🎯 Marker baru dibuat di:', latLng)
              } else {
                markerRef.current.setLatLng(latLng)
                mapRef.current.panTo(latLng)
                console.log('🔄 Marker diperbarui ke:', latLng)
              }
            } else {
              console.warn('⚠️ Map reference tidak tersedia')
            }
          } else {
            console.warn('⚠️ Koordinat tidak valid atau kosong:', { lat, lon, data })
          }
        } else {
          console.log('🔴 Pelacakan tidak aktif atau data tidak ditemukan:', data)
          if (markerRef.current && mapRef.current) {
            mapRef.current.removeLayer(markerRef.current)
            markerRef.current = null
            console.log('🗑️ Marker dihapus karena status tidak aktif')
          }
        }
      },
      (error) => {
        console.error('❌ Firebase listener error:', error)
      },
    )
  }

  const cleanupMap = () => {
    console.log('🧹 Membersihkan map dan Firebase listener...')

    // Cleanup Firebase listener
    if (carRefGlobal.current && selectedCarId) {
      carRefGlobal.current
        .update({ status: '0' })
        .then(() => {
          console.log('🔴 Status tracking diatur ke tidak aktif untuk mobil ID:', selectedCarId)
        })
        .catch((error) => {
          console.error('❌ Error updating status:', error)
        })

      carRefGlobal.current.off('value')
      carRefGlobal.current = null
    }

    // Cleanup marker
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current)
      markerRef.current = null
    }

    // Cleanup map
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    setMapLoaded(false)
    console.log('✅ Cleanup selesai')
  }

  const handleCloseTrackingModal = () => {
    console.log('🚪 Menutup modal tracking...')
    cleanupMap()
    setTrackingModalVisible(false)
    setSelectedCarId(null)
    setSelectedCarData(null)
  }

  const handleSuccess = (message) => {
    setModalVisible(false)
    setSelectedId(null)
    Toast.success(message)
    setReload((prev) => !prev)
  }

  const handleError = (message) => {
    Toast.error(message)
  }

  const columns = [
    { key: 'plate_number', label: 'Nomor Plat' },
    { key: 'car_type.car_name', label: 'Nama Mobil' },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item) => (
        <div className="d-flex align-items-center gap-2">
          <CButton
            color="info"
            size="sm"
            onClick={() => handleTrackLocation(item)}
            title="Lacak Lokasi"
          >
            <CIcon icon={cilLocationPin} />
          </CButton>
          <EditButton onClick={() => handleEdit(item.id)} />
          <DeleteButton onClick={() => handleDelete(item.id)} />
        </div>
      ),
    },
  ]

  const endpoint = '/api/owner-cars'
  const section = 'Owner Car'
  const fields = [
    {
      name: 'car_type_id',
      label: 'Nama Mobil',
      type: 'custom',
      component: CarCategorySelect,
    },
    { name: 'plate_number', label: 'Nomor Plat', type: 'text' },
  ]

  return (
    <>
      <CCard className="mb-4 p-4">
        <CCardBody className="d-flex flex-column gap-4">
          <div className="d-flex justify-content-between align-items-center">
            <h4>Manage Owner Car</h4>
            <CButton color="primary" className="p-2 px-3 fw-medium" onClick={handleAdd}>
              Tambah Owner Car
            </CButton>
          </div>

          <PaginatedTable columns={columns} endpoint={endpoint} reload={reload} />
        </CCardBody>
      </CCard>

      {/* Modal untuk tracking lokasi */}
      <CModal
        visible={trackingModalVisible}
        onClose={handleCloseTrackingModal}
        size="xl"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader closeButton>
          <CModalTitle>
            <CIcon icon={cilLocationPin} className="me-2" />
            Lacak Lokasi - {selectedCarData?.plate_number || 'Kendaraan'}
            {selectedCarData?.car_type?.car_name && (
              <span className="text-muted ms-2">({selectedCarData.car_type.car_name})</span>
            )}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-0">
          <div style={{ height: '70vh', width: '100%', position: 'relative' }}>
            {!mapLoaded && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                  background: 'rgba(255,255,255,0.9)',
                  padding: '20px',
                  borderRadius: '8px',
                }}
              >
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 mb-0">Memuat peta...</p>
                </div>
              </div>
            )}
            <div
              ref={mapContainerRef}
              id={`tracking-map-${selectedCarId || 'default'}`}
              style={{
                height: '100%',
                width: '100%',
                minHeight: '70vh',
              }}
            />
          </div>
          <div className="p-3 bg-light border-top">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Status pelacakan akan otomatis diaktifkan. Pastikan GPS device mengirim data ke
                Firebase.
              </small>
              <CButton color="secondary" onClick={handleCloseTrackingModal}>
                Tutup Pelacakan
              </CButton>
            </div>
          </div>
        </CModalBody>
      </CModal>

      <CrudModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedId(null)
        }}
        mode={modalMode}
        id={selectedId}
        endpoint={endpoint}
        fields={fields}
        titleMap={{
          store: `Tambah ${section}`,
          edit: `Edit ${section}`,
          delete: `Hapus ${section}`,
        }}
        onSuccess={() => {
          const message =
            modalMode === 'edit'
              ? `${section} berhasil diupdate`
              : modalMode === 'delete'
                ? `${section} berhasil dihapus`
                : `${section} berhasil ditambahkan`
          handleSuccess(message)
        }}
        onError={handleError}
      />
    </>
  )
}

export default ManageOwnerCar
