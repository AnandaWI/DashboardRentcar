import { useState } from 'react'
import { CButton, CCard, CCardBody, CModal, CModalBody, CModalFooter } from '@coreui/react'
import { PaginatedTable } from '../components'
import FeaturesCrudModal from '../components/modals/FeaturesCrudModal'
import DeleteButton from '../components/buttons/DeleteButton'
import { useToast } from '../components/ToastManager'
import axiosInstance from '../core/axiosInstance'
import EditButton from '../components/buttons/EditButton'

const ManageFeatures = () => {

  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('store') // 'store' | 'edit'
  const [selectedId, setSelectedId] = useState(null)
  const [reload, setReload] = useState(false)

  const [photoModalVisible, setPhotoModalVisible] = useState(false)
  const [photoModalUrl, setPhotoModalUrl] = useState('')

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const Toast = useToast()

  const openModal = (mode, id = null) => {
    setModalMode(mode)
    setSelectedId(id)
    setModalVisible(true)
  }

  const openPhotoModal = (url) => {
    setPhotoModalUrl(url)
    setPhotoModalVisible(true)
  }

  const closePhotoModal = () => {
    setPhotoModalVisible(false)
    setPhotoModalUrl('')
  }

  const openDeleteModal = (id) => {
    setDeleteId(id)
    setDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/api/features/${deleteId}`)
      Toast.success('Feature berhasil dihapus')
      setReload((prev) => !prev)
    } catch (err) {
      console.error(err)
      Toast.error('Gagal menghapus feature')
    } finally {
      setDeleteModalVisible(false)
      setDeleteId(null)
    }
  }

  const handleSuccess = () => {
    const message =
      modalMode === 'edit'
        ? 'Feature berhasil diupdate'
        : 'Feature berhasil ditambahkan'

    setModalVisible(false)
    setSelectedId(null)
    Toast.success(message)
    setReload((prev) => !prev)
  }

  const handleError = (message) => {
    Toast.error(message)
  }

  const columns = [
    { key: 'name', label: 'Nama' },
    { key: 'description', label: 'Deskripsi' },
    {
      key: 'img_url',
      label: 'Foto',
      render: (item) =>
        item.img_url ? (
          <div className="d-flex gap-2">
            <CButton
                key={item.id}
                color="primary"
                onClick={() => openPhotoModal(item.img_url)}
              >
                Lihat Foto
              </CButton>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item) => (
        <div className="d-flex align-items-center gap-2">
          <DeleteButton onClick={() => openDeleteModal(item.id)} />
        <EditButton onClick={() => openModal('edit', item.id)} />
        </div>
      ),
    },
  ]

  const endpoint = '/api/features'
  const section = 'Features'

  const fields = [
    { name: 'data.name', label: 'Nama', type: 'text', required: true },
    { name: 'data.description', label: 'Deskripsi', type: 'textarea', required: true },
    { name: 'file_img_url1', label: 'Gambar 1', type: 'file', accept: 'image/*', required: true },
  ]

  return (
    <>
      <CCard className="mb-4 p-4">
        <CCardBody className="d-flex flex-column gap-4">
          <div className="d-flex justify-content-between align-items-center">
            <h4>Manage Features</h4>
            <CButton color="primary" onClick={() => openModal('store')}>
              Tambah Feature
            </CButton>
          </div>

          <PaginatedTable columns={columns} endpoint={endpoint} reload={reload} />
        </CCardBody>
      </CCard>

      {/* Modal Foto */}
      <CModal visible={photoModalVisible} onClose={closePhotoModal} size="lg">
        <CModalBody className="d-flex justify-content-center">
          <img src={photoModalUrl} alt="Foto" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </CModalBody>
      </CModal>

      {/* Modal CRUD */}
      <FeaturesCrudModal
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
        }}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      {/* Modal Delete */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalBody>Apakah Anda yakin ingin menghapus feature ini?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Batal
          </CButton>
          <CButton color="danger" className='text-white' onClick={handleDeleteConfirm}>
            Hapus
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ManageFeatures
