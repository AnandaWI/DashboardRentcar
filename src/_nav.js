import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBlind,
  cilCog,
  cilHistory,
  cilList,
  cilLowVision,
  cilMonitor,
  cilNotes,
  cilSpeedometer,
  cilTag,
  cilUser,
} from '@coreui/icons'

import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const getNav = (roles = []) => {
  const nav = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    },
    {
      component: CNavTitle,
      name: 'MASTER DATA',
    },
    {
      component: CNavItem,
      name: 'Manage Car Category',
      to: '/manage-car-category',
      icon: <CIcon icon={cilList} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Manage Car',
      to: '/manage-car',
      icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Manage Service',
      to: '/manage-service',
      icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Manage Driver',
      to: '/manage-driver',
      icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    },
    {
      component: CNavTitle,
      name: 'User',
    },
    // Kondisional: hanya tampil kalau superadmin
    ...(roles.includes('superadmin')
      ? [
          {
            component: CNavItem,
            name: 'Manage Admin',
            to: '/manage-admin',
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          },
        ]
      : []),
    {
      component: CNavItem,
      name: 'Manage Blindstick',
      to: '/manage-blindstick',
      icon: <CIcon icon={cilLowVision} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Manage Pemantau',
      to: '/manage-pemantau',
      icon: <CIcon icon={cilMonitor} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Manage Penyandang',
      to: '/manage-penyandang',
      icon: <CIcon icon={cilBlind} customClassName="nav-icon" />,
    },
    {
      component: CNavTitle,
      name: 'Settings',
    },

    ...(roles.includes('superadmin')
      ? [
          {
            component: CNavItem,
            name: 'Riwayat Aplikasi',
            to: '/app-history',
            icon: <CIcon icon={cilHistory} customClassName="nav-icon" />,
          },
        ]
      : []),

    {
      component: CNavItem,
      name: 'User Settings',
      to: '/profile',
      icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
    },
  ]

  return nav
}

export default getNav
