import { element } from 'prop-types'
import React from 'react'

const AppHistory = React.lazy(() => import('./views/ManageAppHistory'))
const Dashboard = React.lazy(() => import('./views/Dashboard'))
const ManageCarCategory = React.lazy(() => import('./views/ManageCarCategory'))
const ManageCar = React.lazy(() => import('./views/ManageCar'))
const ManageAdmin = React.lazy(() => import('./views/ManageAdmin'))
const Profile = React.lazy(() => import('./views/Profile'))
const ManagePost = React.lazy(() => import('./views/ManagePost'))
const ManagePostAdd = React.lazy(() => import('./views/ManagePostAdd'))
const ManageService = React.lazy(() => import('./views/ManageService'))
const ManageFeatures = React.lazy(() => import('./views/ManageFeatures'))
const ManageDestination = React.lazy(() => import('./views/ManageDestination'))
const ManageDriver = React.lazy(() => import('./views/ManageDriver'))
const ManageOwnerCar = React.lazy(() => import('./views/ManageOwnerCar'))
const ManageEvent = React.lazy(() => import('./views/ManageEvent'))
const Order = React.lazy(() => import('./views/Order'))

// Maps
const Maps = React.lazy(() => import('./views/Maps/Maps'))

// FOrm
const CarForm = React.lazy(() => import('./views/CarForm/CarForm'))
const CarShow = React.lazy(() => import('./views/CarForm/CarShow'))

const DestinationForm = React.lazy(() => import('./views/DestinationForm/destinationForm'))
const DestinationEdit = React.lazy(() => import('./views/DestinationForm/destinationFormEdit'))

const routes = [
  { path: '/', exact: true, name: 'Home', element: Dashboard },
  { path: '/app-history', name: 'App History', element: AppHistory, roles: ['superadmin'] },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/manage-car-category', name: 'Manage Car Category', element: ManageCarCategory },
  { path: '/manage-car', name: 'Manage Car', element: ManageCar },
  { path: '/manage-service', name: 'Manage Service', element: ManageService },
  { path: '/manage-destination', name: 'Manage Destination', element: ManageDestination },
  { path: '/manage-features', name: 'Manage Features', element: ManageFeatures },
  { path: '/manage-driver', name: 'Manage Driver', element: ManageDriver },
  { path: '/order', name: 'Order', element: Order },
  { path: '/manage-post', name: 'Manage Post', element: ManagePost },
  { path: '/manage-post/add', name: 'Manage Post', element: ManagePostAdd },
  { path: '/manage-admin', name: 'Manage Admin', element: ManageAdmin, roles: ['superadmin'] },
  { path: '/profile', name: 'Profile', element: Profile },

  { path: '/manage-car/car-form', name: 'Car Form', element: CarForm },
  { path: '/manage-car/car-form/:id', name: 'Car Show', element: CarShow },

  {
    path: '/manage-destination/destination-form',
    name: 'Destination Form',
    element: DestinationForm,
  },
  {
    path: '/manage-destination/destination-form/:id',
    name: 'Destination Form',
    element: DestinationEdit,
  },
  { path: '/manage-owner-car', name: 'Manage Owner Car', element: ManageOwnerCar },
  { path: '/manage-event', name: 'Manage Event', element: ManageEvent },
  { path: '/maps', name: 'Maps', element: Maps },
]

export default routes
