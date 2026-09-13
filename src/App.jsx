import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import io from 'socket.io-client'
import L from 'leaflet'

const socket = io('https://lifebot-backend-u26q.onrender.com')

const droneIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/9357/9357591.png',
  iconSize: [45, 45],
  iconAnchor: [22, 22]
})

function App() {
  const [currentPosition, setCurrentPosition] = useState([12.9716, 77.5946])
  const [flightPath, setFlightPath] = useState([[12.9716, 77.5946]])
  const [telemetry, setTelemetry] = useState({ alt: 0, speed: 0, battery: 100 })

  useEffect(() => {
    socket.on('telemetry_update', (data) => {
      if (data.lat && data.lng) {
        const newPos = [data.lat, data.lng]
        setCurrentPosition(newPos)
        setFlightPath(prevPath => [...prevPath, newPos])
      }
      setTelemetry({
        alt: data.alt || 0,
        speed: data.speed || 0,
        battery: data.battery || 100
      })
    })
    return () => socket.off('telemetry_update')
  }, [])

  return (
    <div style={{ backgroundColor: '#f1f5f9', color: '#1e293b', minHeight: '100vh', padding: '2rem', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      
      {/* 🚀 SMOOTH, LIGHT THEME CSS */}
      <style>
        {`
          /* Blinking recording light */
          @keyframes pulse-red {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .recording-dot {
            animation: pulse-red 1.5s infinite;
          }

          /* Smooth scanner line for the camera box */
          @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          .scanner-line {
            position: absolute;
            left: 0;
            width: 100%;
            height: 3px;
            background: rgba(59, 130, 246, 0.4);
            animation: scan 3s linear infinite;
          }

          /* Clean White Panels with Soft Shadows */
          .clean-panel {
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
          }
        `}
      </style>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#2563eb' }}>6IX LIFEBOT</span> <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '1.5rem' }}>/ MEDICAL EMERGENCY DRONE (MED)</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ecfdf5', padding: '8px 16px', borderRadius: '50px', border: '1px solid #a7f3d0' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
          <span style={{ color: '#047857', fontWeight: '700', letterSpacing: '0.5px', fontSize: '0.85rem' }}>LINK ACTIVE</span>
        </div>
      </header>
      
      {/* MAIN GRID */}
      <div style={{ display: 'flex', gap: '2rem', height: '75vh' }}>
        
        {/* LEFT: THE MAP */}
        <div className="clean-panel" style={{ flex: '2.5', overflow: 'hidden', position: 'relative' }}>
          <MapContainer center={currentPosition} zoom={16} style={{ height: '100%', width: '100%' }}>
            {/* Standard, crisp, beautiful OpenStreetMap */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {/* Smooth blue flight path */}
            <Polyline positions={flightPath} color="#2563eb" weight={5} opacity={0.8} />
            <Marker position={currentPosition} icon={droneIcon} />
          </MapContainer>
        </div>

        {/* RIGHT: THE SIDEBAR */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* CAMERA FEED */}
          <div className="clean-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, letterSpacing: '1.5px', fontWeight: '700' }}>ESP32-CAM LINK</h2>
              <span className="recording-dot" style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>● REC</span>
            </div>
            
            <div style={{ backgroundColor: '#f8fafc', height: '200px', borderRadius: '12px', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px dashed #cbd5e1' }}>
              <div className="scanner-line"></div>
              <span style={{ color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '1px', zIndex: 10 }}>
                WAITING FOR VIDEO SIGNAL...
              </span>
            </div>
          </div>

          {/* TELEMETRY */}
          <div className="clean-panel" style={{ padding: '1.5rem', flexGrow: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h2 style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem 0', letterSpacing: '1.5px', fontWeight: '700' }}>LIVE TELEMETRY</h2>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Altitude */}
              <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <p style={{ color: '#64748b', margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: '600' }}>ALTITUDE</p>
                <p style={{ fontSize: '2.5rem', margin: '0', fontWeight: '800', color: '#0f172a' }}>
                  {telemetry.alt} <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: '600' }}>m</span>
                </p>
              </div>

              {/* Speed */}
              <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <p style={{ color: '#64748b', margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: '600' }}>AIRSPEED</p>
                <p style={{ fontSize: '2.5rem', margin: '0', fontWeight: '800', color: '#0f172a' }}>
                  {telemetry.speed} <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: '600' }}>m/s</span>
                </p>
              </div>
            </div>

            {/* Battery */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <p style={{ color: '#64748b', margin: '0', fontSize: '0.8rem', fontWeight: '600' }}>PAYLOAD BATTERY</p>
                <p style={{ margin: '0', fontWeight: '800', fontSize: '1.1rem', color: telemetry.battery > 20 ? '#10b981' : '#ef4444' }}>
                  {telemetry.battery}%
                </p>
              </div>
              <div style={{ height: '10px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${telemetry.battery}%`, 
                  backgroundColor: telemetry.battery > 20 ? '#10b981' : '#ef4444',
                  transition: 'width 0.5s ease-in-out',
                  borderRadius: '10px'
                }}></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default App