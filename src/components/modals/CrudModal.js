import React, { useEffect, useState } from 'react'
import { CSpinner } from '@coreui/react'
import axiosInstance from '../../core/axiosInstance'
import CenteredModal from '../CenteredModal'
import supabaseService from '../../core/supabaseService'

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ''), obj)
}

const CrudModal = ({
  visible,
  onClose,
  mode = 'store',
  id = null,
  onSuccess,
  titleMap = {
    store: 'Tambah Data',
    edit: 'Edit Data',
    delete: 'Hapus Data',
    resetPassword: 'Reset Password',
  },
  endpoint,
  fields = [],
  onError,
  customHandleChange,
  customHandleSubmit,
  isSubmit = false,
}) => {
  const isEdit = mode === 'edit'
  const isDelete = mode === 'delete'
  const isReset = mode === 'resetPassword'

  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(isSubmit)

  useEffect(() => {
    if (!visible) {
      setFormData({})
      return
    }

    if ((isEdit || isDelete || isReset) && id) {
      setLoading(true)
      axiosInstance
        .get(`${endpoint}/${id}`)
        .then((res) => {
          const data = {}
          fields.forEach((field) => {
            data[field.name] = getNestedValue(res.data, field.name)
          })
          setFormData(data)
        })
        .catch((err) => {
          console.error('Failed to fetch data:', err)
          onError?.('Gagal memuat data. Silakan coba lagi.')
        })
        .finally(() => setLoading(false))
    } else {
      const initial = {}
      fields.forEach((field) => {
        initial[field.name] = ''
      })
      setFormData(initial)
    }
  }, [visible, isEdit, isDelete, isReset, id, fields, endpoint, onError])

  useEffect(() => {
    setSubmitting(isSubmit)
  }, [isSubmit])

  const buildPayload = (flatObj) => {
    const payload = {}
    Object.keys(flatObj).forEach((path) => {
      const keyParts = path.split('.')
      const finalKey = keyParts[keyParts.length - 1]
      payload[finalKey] = flatObj[path]
    })
    return payload
  }

  const defaultHandleSubmit = async () => {
    // Validasi field
    if ((isEdit || mode === 'store') && fields.some((f) => {
      if (f.type === 'file') return false; 
      return !formData[f.name];
    })) {
      onError?.('Semua field wajib diisi.');
      return;
    }
  
    setSubmitting(true);
    
    try {
      // Buat payload simpel dari formData
      let simplePayload = buildPayload(formData);
  
      // Upload file dan update payload dengan public URL
      for (const field of fields) {
        if (field.type === 'file' && formData[field.name]) {
          let fileObj = formData[field.name];
          if (fileObj instanceof FileList) {
            if (fileObj.length === 0) continue;
            fileObj = fileObj[0];
          }
          if (fileObj instanceof File) {
            const locationPath = field.location || 'public/default';
            const uploadedPath = await supabaseService.upload(locationPath, fileObj);
            const publicUrl = supabaseService.getPublicUrl(uploadedPath);
            simplePayload[field.name] = publicUrl;
          }
        }
      }
  
      let api;
      if (isReset) {
        api = axiosInstance.post(`${endpoint}/${id}/reset_password`);
      } else if (isDelete) {
        api = axiosInstance.delete(`${endpoint}/${id}`);
      } else if (isEdit) {
        api = axiosInstance.put(`${endpoint}/${id}`, simplePayload);
      } else {
        api = axiosInstance.post(endpoint, simplePayload);
      }
  
      await api;
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Submission failed:', err);
      const errorMsg = err?.response?.data?.detail || err.message || 'Terjadi kesalahan. Coba lagi.';
      onError?.(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }
  
  
  const buildNestedPayload = (flatData) => {
    const result = {};
    Object.entries(flatData).forEach(([key, value]) => {
      const keys = key.split('.');
      let current = result;
      keys.forEach((k, i) => {
        if (i === keys.length - 1) {
          current[k] = value;
        } else {
          if (!current[k]) current[k] = {};
          current = current[k];
        }
      });
    });
    return result;
  };
  
  const handleSubmit = async () => {
    // flatFormData is object with keys like "data.name", "data.img_url" with file object in "data.img_url"
    let flatFormData = getFormDataSomehow();
  
    // Handle file upload and replace file on flatFormData with uploaded URL
    for(const field of fields) {
      if(field.type === 'file' && flatFormData[field.name]) {
        let fileObject = flatFormData[field.name];
        if(fileObject instanceof FileList) {
          if(fileObject.length > 0) fileObject = fileObject[0];
        }
        if(fileObject instanceof File) {
          const location = field.location || 'public/default';
          const uploadedPath = await supabaseService.upload(location, fileObject);
          const publicUrl = supabaseService.getPublicUrl(uploadedPath);
          flatFormData[field.name] = publicUrl; // Replace file object with URL string here
        }
      }
    }
  
    // Build nested object payload based on dot notation keys
    const nestedPayload = buildNestedPayload(flatFormData);
  
    // Send nestedPayload to API
    await axiosInstance.post(endpoint, nestedPayload);
  };
  

  const defaultHandleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files : value,
    }));
  }
  

  return (
    <CenteredModal
      visible={visible}
      onClose={onClose}
      title={titleMap[mode]}
      onSave={handleSubmit}
      loading={submitting || loading}
      saveButtonText={isDelete ? 'Hapus' : isReset ? 'Reset' : undefined}
      saveButtonColor={isDelete ? 'danger' : isReset ? 'warning' : undefined}
    >
      {loading ? (
        <div className="text-center py-5">
          <CSpinner color="primary" />
        </div>
      ) : isDelete ? (
        <div>
          <p>Apakah Anda yakin ingin menghapus data ini?</p>
          {submitting && (
            <div className="text-center mt-3">
              <CSpinner color="danger" />
            </div>
          )}
        </div>
      ) : isReset ? (
        <div>
          <p>
            Apakah Anda yakin ingin me-reset password user{' '}
            <strong>{formData['blindstick.mac_address'] || ''}</strong> ke <code>password</code>?
          </p>
          {submitting && (
            <div className="text-center mt-3">
              <CSpinner color="warning" />
            </div>
          )}
        </div>
      ) : (
        <div>
          {fields.map(({ name, label, type = 'text', placeholder, options, accept }) => (
            <div className="mb-3" key={name}>
              <label htmlFor={name} className="form-label">
                {label}
              </label>
              {type === 'select' ? (
                <select
                  name={name}
                  id={name}
                  value={formData[name] ?? ''}
                  className="form-select"
                  onChange={(e) => {
                    if (customHandleChange) {
                      customHandleChange(e, setFormData)
                    } else {
                      defaultHandleChange(e)
                    }
                  }}
                >
                  <option value="">Pilih {label}</option>
                  {options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  id={name}
                  value={type === 'file' ? undefined : (formData[name] ?? '')}
                  placeholder={placeholder || `Masukkan ${label.toLowerCase()}`}
                  className="form-control"
                  onChange={(e) => {
                    if (customHandleChange) {
                      customHandleChange(e, setFormData)
                    } else {
                      defaultHandleChange(e)
                    }
                  }}
                  {...(type === 'file' ? { accept } : {})}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </CenteredModal>
  )
}

export default CrudModal
