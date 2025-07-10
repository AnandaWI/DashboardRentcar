import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { CButton, CSidebar, CSidebarBrand, CSidebarFooter, CSidebarHeader } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAccountLogout } from '@coreui/icons'

import { AppSidebarNav } from './AppSidebarNav'

import getNav from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const roles = JSON.parse(localStorage.getItem('roles')) || []

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom d-flex justify-content-center">
        <CSidebarBrand style={{ textDecoration: 'none', fontWeight: 'bold' }} to="/">
          {/* <img
            src="../../public/logo-monochrome.svg"
            alt="Logo"
            style={{ height: '30px', marginRight: '8px' }}
          /> */}
          <h5 style={{ display: 'inline', margin: 0 }}>AEM RentCar</h5>
        </CSidebarBrand>
      </CSidebarHeader>

      <AppSidebarNav items={getNav(roles)} />

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CButton
          color="danger"
          className="w-100 text-white"
          onClick={() => {
            localStorage.clear()
            window.location.href = '#/login' // pakai HashRouter
          }}
        >
          <CIcon icon={cilAccountLogout} customClassName="me-2" height={16} />
          Logout
        </CButton>
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
