import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './maps.css'
import { database } from '../../core/FirebaseService'

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const Maps = () => {
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapContainerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Pastikan container ada sebelum inisialisasi
    if (!mapContainerRef.current) return

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView([-2.5489, 118.0149], 5)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current)

    setMapLoaded(true)

    const carRef = database.ref('owner_car/1')

    // Set status = "1" on page load
    carRef.update({ status: '1' })
    console.log('🚀 Status tracking diatur ke aktif')

    // Reset status = "0" on unload
    const handleUnload = () => {
      carRef.update({ status: '0' })
      console.log('🔴 Status tracking diatur ke tidak aktif')
    }
    window.addEventListener('beforeunload', handleUnload)

    // Watch for changes
    carRef.on('value', (snapshot) => {
      const data = snapshot.val()
      
      console.log('📡 Data diterima dari Firebase:', data)

      if (data && data.status === '1') {
        console.log('🟢 Status tracking aktif')
        
        const lat = parseFloat(data.latitude)
        const lon = parseFloat(data.longitude)
        
        if (!isNaN(lat) && !isNaN(lon)) {
          const latLng = [lat, lon]
          console.log('📍 Koordinat diterima:', latLng)

          if (!markerRef.current) {
            markerRef.current = L.marker(latLng)
              .addTo(mapRef.current)
              .bindPopup('Posisi Kendaraan Saat Ini.')
              .openPopup()
            mapRef.current.setView(latLng, 15)
            console.log('🎯 Marker baru dibuat di:', latLng)
          } else {
            markerRef.current.setLatLng(latLng)
            mapRef.current.panTo(latLng)
            console.log('🔄 Marker diperbarui ke:', latLng)
          }
        } else {
          console.warn('⚠️ Koordinat tidak valid:', { lat, lon })
        }
      } else {
        console.log('🔴 Pelacakan tidak aktif (status != 1) atau data tidak ditemukan')
        if (markerRef.current) {
          markerRef.current.remove()
          markerRef.current = null
          console.log('🗑️ Marker dihapus karena status tidak aktif')
        }
      }
    })

    return () => {
      // Cleanup
      carRef.off('value')
      handleUnload()
      window.removeEventListener('beforeunload', handleUnload)
      
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div ref={mapContainerRef} id="map" style={{ height: '100%', width: '100%' }} />
    </div>
  )
}

export default Maps
