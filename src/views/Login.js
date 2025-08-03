import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CCardText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import axiosInstance from '../core/axiosInstance'
import { useToast } from '../components/ToastManager'
import { AppFooter } from '../components'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState([])
  const navigate = useNavigate()
  const Toast = useToast()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError([])
    try {
      const data = { email, password }
      const response = await axiosInstance.post('/api/login', data)

      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      const roleNames = response.data.user.roles.map((role) => role.name)

      localStorage.setItem('roles', JSON.stringify(roleNames))

      navigate('/dashboard')
    } catch (err) {
      let messages = ['Login failed']
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        messages = Array.isArray(detail) ? detail.map((item) => item.msg) : [detail]
      }
      setError(messages)
      messages.forEach((msg) => Toast.error(msg))
    }
  }

  return (
    <>
      {/* Container utama diubah menjadi flex-column.
        Ini akan mengatur children-nya (konten dan footer) secara vertikal.
      */}
      <div className="bg-body-tertiary min-vh-100 d-flex flex-column">
        {/* Wrapper baru ini akan "tumbuh" mengisi ruang kosong (flex-grow-1)
          dan tetap menjaga form login di tengah secara vertikal (align-items-center).
        */}
        <div className="d-flex flex-grow-1 align-items-center">
          <CContainer>
            <CRow className="justify-content-center">
              <CCol md={10}>
                <CCardGroup>
                  {/* Deskripsi Project + Logo */}
                  <CCard className="p-4 text-center ">
                    <CCardBody>
                      {/* <img
                        src="/logo.svg" // Path lebih baik dimulai dari root public
                        alt="AEM RentCar Logo"
                        style={{ height: '100px', marginBottom: '1rem' }}
                      /> */}
                      <h4 className="fw-bold text-body">AEM RentCar</h4>
                      <CCardText className="text-body-secondary" style={{ fontSize: '0.9rem' }}>
                        AEM RentCar adalah perusahaan sewa mobil premium dan ekonomi yang
                        mengutamakan keamanan, kenyamanan, dan keselamatan penumpang dengan drver
                        yang profesional dan berpengalaman.
                      </CCardText>
                    </CCardBody>
                  </CCard>

                  {/* Form Login */}
                  <CCard className="p-4">
                    <CCardBody>
                      <CForm onSubmit={handleLogin}>
                        <h1>Login</h1>
                        <p className="text-body-secondary">
                          Login untuk masuk Dashboard AEM RentCar
                        </p>
                        <CInputGroup className="mb-3">
                          <CInputGroupText>
                            <CIcon icon={cilUser} />
                          </CInputGroupText>
                          <CFormInput
                            placeholder="Email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </CInputGroup>
                        <CInputGroup className="mb-4">
                          <CInputGroupText>
                            <CIcon icon={cilLockLocked} />
                          </CInputGroupText>
                          <CFormInput
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </CInputGroup>
                        <CRow>
                          <CCol>
                            <CButton type="submit" color="primary" className="px-4 w-100">
                              Login
                            </CButton>
                          </CCol>
                        </CRow>
                      </CForm>
                    </CCardBody>
                  </CCard>
                </CCardGroup>
              </CCol>
            </CRow>
          </CContainer>
        </div>

        {/* Footer sekarang berada di dalam container flex utama */}
        <AppFooter />
      </div>
    </>
  )
}

export default Login
