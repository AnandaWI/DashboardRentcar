import { CCard, CCardBody, CBadge, CButton } from '@coreui/react'
import { PaginatedTable } from '../components'
import { useState } from 'react'
import axiosInstance from '../core/axiosInstance'
import { useToast } from '../components/ToastManager'

const Order = () => {
  const [reload, setReload] = useState(false)
  const Toast = useToast()

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus order ini?')) {
      try {
        console.log('Attempting to delete order with ID:', id)

        const response = await axiosInstance.delete(`/api/orders/${id}`)

        console.log('Delete response:', response.data)

        if (response.data.success) {
          Toast.success('Order berhasil dihapus!')
          setReload(!reload) // Trigger reload data
        } else {
          Toast.error(response.data.message || 'Gagal menghapus order')
        }
      } catch (error) {
        console.error('Error deleting order:', error)

        // Handle different types of errors
        if (error.response) {
          // Server responded with error status
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Server error: ${error.response.status}`
          console.error('Server error response:', error.response.data)
          alert(`Gagal menghapus order: ${errorMessage}`)
        } else if (error.request) {
          // Request was made but no response received
          console.error('No response received:', error.request)
          alert('Gagal menghapus order: Tidak ada respons dari server')
        } else {
          // Something else happened
          console.error('Request setup error:', error.message)
          alert(`Gagal menghapus order: ${error.message}`)
        }
      }
    }
  }

  const columns = [
    {
      key: 'customer_name',
      label: 'Nama Customer',
      style: { width: '150px', minWidth: '150px' },
    },
    {
      key: 'order_date',
      label: 'Tanggal Order Masuk',
      style: { width: '130px', minWidth: '130px' },
    },
    {
      key: 'email',
      label: 'Email',
      style: { width: '180px', minWidth: '180px' },
    },
    {
      key: 'phone',
      label: 'No HP',
      style: { width: '120px', minWidth: '120px' },
    },
    {
      key: 'address',
      label: 'Alamat Penjemputan',
      style: { width: '200px', minWidth: '200px' },
    },
    {
      key: 'pickup_time',
      label: 'Jam Penjemputan',
      style: { width: '130px', minWidth: '130px', textAlign: 'center' },
      render: (item) => {
        const time = item.pickup_time?.substring(0, 5) || '-'
        return <span>{time}</span>
      },
    },
    {
      key: 'car_types',
      label: 'Tipe Mobil & Unit',
      style: { width: '220px' },
      render: (item) => {
        // Jika ada car_details dari API
        if (item.car_details && Array.isArray(item.car_details)) {
          return (
            <div>
              {item.car_details.map((car, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                  <strong>{car.name}</strong>
                  <span className="badge bg-primary">{car.count} unit</span>
                </div>
              ))}
            </div>
          )
        }
        
        // Fallback untuk format lama
        return item.car_types || '-';
      },
    },
    {
      key: 'destination',
      label: 'Destinasi',
      style: { width: '150px', minWidth: '150px' },
    },
    {
      key: 'detail_destination',
      label: 'Detail Destinasi',
      style: { width: '200px', minWidth: '200px' },
    },
    {
      key: 'rent_date',
      label: 'Tanggal Sewa',
      style: { width: '120px', minWidth: '120px' },
    },
    {
      key: 'days',
      label: 'Durasi (Hari)',
      style: { width: '100px', minWidth: '100px', textAlign: 'center' },
    },
    {
      key: 'total_price',
      label: 'Total Harga',
      style: { width: '130px', minWidth: '130px', textAlign: 'right' },
    },
    {
      key: 'status',
      label: 'Status',
      style: { width: '100px', minWidth: '100px', textAlign: 'center' },
      render: (item) => {
        const getStatusColor = (status) => {
          switch (status) {
            case 'pending':
              return 'warning'
            case 'paid':
              return 'success'
            case 'cancelled':
              return 'danger'
            case 'completed':
              return 'info'
            default:
              return 'success'
          }
        }
        return <CBadge color={getStatusColor(item.status)}>{item.status}</CBadge>
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      style: { width: '100px', minWidth: '100px', textAlign: 'center' },
      render: (item) => (
        <div className="d-flex gap-2 justify-content-center">
          <CButton
            color="danger"
            size="sm"
            onClick={() => handleDelete(item.id)}
            title="Hapus Order"
          >
            Hapus
          </CButton>
        </div>
      ),
    },
  ]

  const endpoint = '/api/orders'

  return (
    <CCard className="mb-4 p-4">
      <CCardBody className="d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-center">
          <h4>Manage Orders</h4>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <PaginatedTable
            columns={columns}
            endpoint={endpoint}
            searchPlaceholder="Cari berdasarkan nama, email, atau no HP..."
            showActions={false}
            reload={reload}
          />
        </div>
      </CCardBody>
    </CCard>
  )
}

export default Order
