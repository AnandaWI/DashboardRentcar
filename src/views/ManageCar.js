import { CButton, CCard, CCardBody } from '@coreui/react'
import { PaginatedTable } from '../components'
import { useState } from 'react'
import CrudModal from '../components/modals/CrudModal'
import EditButton from '../components/buttons/EditButton'
import DeleteButton from '../components/buttons/DeleteButton'
import { useToast } from '../components/ToastManager'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ShowButton from '../components/buttons/ShowButton'

const ManageCar = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('store') // 'store', 'edit', 'delete'
  const [selectedId, setSelectedId] = useState(null)
  const [reload, setReload] = useState(false)
  const Toast = useToast()

  const openModal = (mode, id = null) => {
    setModalMode(mode)
    setSelectedId(id)
    setModalVisible(true)
  }

  const handleAdd = () => {
    window.location.href = '/#/manage-car/car-form'
  }
  const handleEdit = (id) => {
    window.location.href = `/#/manage-car/car-form/${id}`
  }
  const handleDelete = (id) => openModal('delete', id)

  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const categoryId = params.get('category_id') || ''

  const handleFilterChange = (e) => {
    const value = e.target.value
    const newParams = new URLSearchParams(location.search)
    if (value === '') {
      newParams.delete('category_id')
    } else {
      newParams.set('category_id', value)
    }
    newParams.set('page', 1)
    navigate({ search: newParams.toString() })
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
    { key: 'car_name', label: 'Merk Mobil' },
    {
      key: 'category',
      label: 'Kategori',
      render: (item) => item.category?.name || '-', // akses nama kategori dengan aman
    },
    { key: 'capacity', label: 'Kapasitas' },
    { key: 'rent_price', label: 'Harga' },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item) => (
        <div className="d-flex align-items-center gap-2">
          <ShowButton onClick={() => handleEdit(item.id)} />
          <DeleteButton onClick={() => handleDelete(item.id)} />
        </div>
      ),
    },
  ]

  const endpoint = '/api/car-types'
  const section = 'Tag'
  const fields = [
    { name: 'data.car_name', label: 'Merk Mobil', type: 'text' },
    {
      name: 'data.category_id',
      label: 'Kategori',
      type: 'select',
      options: [
        { value: '1', label: 'VIP' },
        { value: '2', label: 'REGULER' },
      ],
    },
    { name: 'data.capacity', label: 'Kapasitas', type: 'number' },
    { name: 'data.rent_price', label: 'Harga', type: 'number' },
  ]

  return (
    <>
      <CCard className="mb-4 p-4">
        <CCardBody className="d-flex flex-column gap-4">
          <div className="d-flex justify-content-between align-items-center">
            <h4>Manage Mobil</h4>

            <div className="d-flex align-items-center gap-2">
              <select
                id="filterStatus"
                className="form-select p-2 px-3"
                style={{ width: '200px' }}
                value={categoryId}
                onChange={handleFilterChange}
              >
                <option value="">Semua Data</option>
                <option value="1">VIP</option>
                <option value="2">Reguler</option>
              </select>
              <CButton color="primary" className="p-2 px-3 fw-medium" onClick={handleAdd}>
                Tambah Mobil
              </CButton>
            </div>
          </div>

          <PaginatedTable columns={columns} endpoint={endpoint} reload={reload} />
        </CCardBody>
      </CCard>

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

export default ManageCar
