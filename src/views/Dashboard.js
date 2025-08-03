import { CRow, CCol, CCard, CCardBody, CCardTitle, CListGroup, CListGroupItem } from '@coreui/react'
import { cilTag, cilUser, cilNotes, cilList } from '@coreui/icons'
import { StatCard, QuickLink } from '../components'
import { useState, useEffect } from 'react'
import { useToast } from '../components/ToastManager'
import axiosInstance from '../core/axiosInstance'
import CrudModal from '../components/modals/CrudModal'
import formatTimeAgo from '../core/formatTimeAgo'

const Dashboard = () => {
  const Toast = useToast()

  const [dashboardData, setDashboardData] = useState({
    totalDriver: 0,
    totalCar: 0,
    totalDestination: 0,
    totalTransaction: 0,
    logTransaction: [],
  })

  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('store')
  const [selectedId, setSelectedId] = useState(null)
  const [currentSection, setCurrentSection] = useState(null)

  const openModal = (section, mode = 'store', id = null) => {
    setCurrentSection(section)
    setModalMode(mode)
    setSelectedId(id)
    setModalVisible(true)
  }

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axiosInstance.get('/api/dashboard')
        const data = response.data.data
        setDashboardData({
          totalDriver: data.total_driver || 0,
          totalCar: data.total_car || 0,
          totalDestination: data.total_destination || 0,
          totalTransaction: data.total_transaction || 0,
          logTransaction: data.log_transaction || [],
        })
      } catch (error) {
        console.error('Failed to fetch dashboard statistics', error)
        Toast.error(error)
      }
    }

    getData()
  }, [])

  return (
    <div className="p-4">
      <CRow className="mb-4">
        <StatCard icon={cilNotes} title="Total Mobil" value={dashboardData.totalCar} />
        <StatCard icon={cilList} title="Total Driver" value={dashboardData.totalDriver} />
        <StatCard icon={cilTag} title="Total Destinasi" value={dashboardData.totalDestination} />
        <StatCard icon={cilUser} title="Total Transaksi" value={dashboardData.totalTransaction} />
      </CRow>

      <CRow>
        <CCol md={6} className="d-flex">
          <CCard className="flex-fill">
            <CCardBody className="p-4">
              <CCardTitle className="h5 mb-3">Transaksi Terakhir</CCardTitle>
              {/* <CListGroup flush>
                {logs.length === 0 ? (
                  <CListGroupItem>No recent activity</CListGroupItem>
                ) : (
                  logs.map((log) => (
                    <CListGroupItem key={log.id} className="mb-2">
                      {log.description}
                      <div className="text-body-secondary small">
                        {formatTimeAgo(log.created_at)}
                      </div>
                    </CListGroupItem>
                  ))
                )}
              </CListGroup> */}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* <CrudModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedId(null)
          setCurrentSection(null)
        }}
        mode={modalMode}
        id={selectedId}
        endpoint={currentSection ? crudConfigs[currentSection]?.endpoint : ''}
        fields={currentSection ? crudConfigs[currentSection]?.fields : []}
        titleMap={{
          store: currentSection ? `Tambah ${currentSection}` : '',
          edit: currentSection ? `Edit ${currentSection}` : '',
          delete: currentSection ? `Hapus ${currentSection}` : '',
        }}
        onSuccess={() => {
          const msg =
            modalMode === 'edit'
              ? `${currentSection} berhasil diupdate`
              : modalMode === 'delete'
                ? `${currentSection} berhasil dihapus`
                : `${currentSection} berhasil ditambahkan`
          Toast.success(msg)
          setModalVisible(false)
          setSelectedId(null)
          setCurrentSection(null)
        }}
        onError={(msg) => Toast.error(msg)}
      /> */}
    </div>
  )
}

export default Dashboard
