import React from 'react'

const AppHistory = React.lazy(() => import('./views/ManageAppHistory'))
const Dashboard = React.lazy(() => import('./views/Dashboard'))
const ManageCarCategory = React.lazy(() => import('./views/ManageCarCategory'))
const ManageCar = React.lazy(() => import('./views/ManageCar'))
const ManageAdmin = React.lazy(() => import('./views/ManageAdmin'))
const ManagePemantau = React.lazy(() => import('./views/ManagePemantau'))
const ManagePenyandang = React.lazy(() => import('./views/ManagePenyandang'))
const ManageBlindstick = React.lazy(() => import('./views/ManageBlindstick'))
const Profile = React.lazy(() => import('./views/Profile'))
const ManagePost = React.lazy(() => import('./views/ManagePost'))
const ManagePostAdd = React.lazy(() => import('./views/ManagePostAdd'))
const ManageService = React.lazy(() => import('./views/ManageService'))
const ManageFeatures = React.lazy(() => import('./views/ManageFeatures'))
const ManageDriver = React.lazy(() => import('./views/ManageDriver'))

// FOrm
const CarForm = React.lazy(() => import('./views/CarForm/CarForm'))
const CarShow = React.lazy(() => import('./views/CarForm/CarShow'))

const routes = [
  { path: '/', exact: true, name: 'Home', element: Dashboard },
  { path: '/app-history', name: 'App History', element: AppHistory, roles: ['superadmin'] },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/manage-car-category', name: 'Manage Car Category', element: ManageCarCategory },
  { path: '/manage-car', name: 'Manage Car', element: ManageCar },
  { path: '/manage-service', name: 'Manage Service', element: ManageService },
  { path: '/manage-features', name: 'Manage Features', element: ManageFeatures },
  { path: '/manage-driver', name: 'Manage Driver', element: ManageDriver },
  { path: '/manage-post', name: 'Manage Post', element: ManagePost },
  { path: '/manage-post/add', name: 'Manage Post', element: ManagePostAdd },
  { path: '/manage-admin', name: 'Manage Admin', element: ManageAdmin, roles: ['superadmin'] },
  { path: '/manage-pemantau', name: 'Manage Pemantau', element: ManagePemantau },
  { path: '/manage-penyandang', name: 'Manage Penyandang', element: ManagePenyandang },
  { path: '/manage-blindstick', name: 'Manage Blindstick', element: ManageBlindstick },
  { path: '/profile', name: 'Profile', element: Profile },

  { path: '/manage-car/car-form', name: 'Car Form', element: CarForm },
  { path: '/manage-car/car-form/:id', name: 'Car Show', element: CarShow },
]

export default routes
