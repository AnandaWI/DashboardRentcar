import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBlind,
  cilCarAlt,
  cilCog,
  cilFace,
  cilFeaturedPlaylist,
  cilHistory,
  cilList,
  cilLocationPin,
  cilLowVision,
  cilMonitor,
  cilNewspaper,
  cilNotes,
  cilSpeedometer,
  cilTag,
  cilUser,
} from '@coreui/icons'

import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

// const getNav = (roles = []) => {
//   const nav = [
//     {
//       component: CNavItem,
//       name: 'Dashboard',
//       to: '/dashboard',
//       icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
//     },
//     {
//       component: CNavTitle,
//       name: 'MASTER DATA',
//     },
//     {
//       component: CNavItem,
//       name: 'Manage Car Category',
//       to: '/manage-car-category',
//       icon: <CIcon icon={cilList} customClassName="nav-icon" />,
//       roles: ['admin'],
//     },
//     {
//       component: CNavItem,
//       name: 'Manage Car',
//       to: '/manage-car',
//       icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
//       roles: ['admin'],
//     },
//     {
//       component: CNavItem,
//       name: 'Manage Destination',
//       to: '/manage-destination',
//       icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
//       roles: ['admin'],
//     },
//     {
//       component: CNavItem,
//       name: 'Manage Service',
//       to: '/manage-service',
//       icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
//       roles: ['admin'],
//     },
//     {
//       component: CNavItem,
//       name: 'Manage Features',
//       to: '/manage-features',
//       icon: <CIcon icon={cilFeaturedPlaylist} customClassName="nav-icon" />,
//       roles: ['admin'],
//     },
//     {
//       component: CNavItem,
//       name: 'Manage Driver',
//       to: '/manage-driver',
//       icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
//       roles: ['admin'],
//     },
//     {
//       component: CNavItem,
//       name: 'Manage Owner Car',
//       to: '/manage-owner-car',
//       icon: <CIcon icon={cilFace} customClassName="nav-icon" />,
//       roles: ['admin', 'owner'],
//     },
//     {
//       component: CNavItem,
//       name: 'Order',
//       to: '/order',
//       icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
//       roles: ['admin', 'owner'],
//     },
//     {
//       component: CNavItem,
//       name: 'Manage Event',
//       to: '/manage-event',
//       icon: <CIcon icon={cilNewspaper} customClassName="nav-icon" />,
//     },
//     // {
//     //   component: CNavItem,
//     //   name: 'Lacak Mobil',
//     //   to: '/maps',
//     //   icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
//     // },
//   ]

//   return nav
// }
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
    ...(roles.includes('admin')
      ? [
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
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Manage Destination',
            to: '/manage-destination',
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Manage Service',
            to: '/manage-service',
            icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Manage Features',
            to: '/manage-features',
            icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Manage Driver',
            to: '/manage-driver',
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Manage Event',
            to: '/manage-event',
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          },
        ]
      : []),

    // Shared: Untuk admin dan owner
    ...(roles.includes('admin') || roles.includes('owner')
      ? [
          {
            component: CNavItem,
            name: 'Manage Owner Car',
            to: '/manage-owner-car',
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Order',
            to: '/order',
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          },
        ]
      : []),
  ]

  return nav
}

export default getNav
