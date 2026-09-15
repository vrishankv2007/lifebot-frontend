import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import io from 'socket.io-client'
import L from 'leaflet'

// ⚠️ IMPORTANT: Keep your Render URL here!
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
  
  // NEW: State to track our payload button animation
  const [deployStatus, setDeployStatus] = useState('STANDBY')

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

  // NEW: The function that runs when you click the button
  const handleDeployPayload = () => {
    if (deployStatus !== 'STANDBY') return;
    
    setDeployStatus('DEPLOYING');
    
    // Simulating a 2-second hardware communication delay
    setTimeout(() => {
      setDeployStatus('SUCCESS');
      
      // Reset the button back to normal after 4 seconds
      setTimeout(() => {
        setDeployStatus('STANDBY');
      }, 4000);
    }, 2000);
  }

 return (
    <>
      {/* 1. The Live Drone Video Player */}
      <div className="w-full h-full min-h-[250px] bg-black rounded-lg overflow-hidden relative shadow-lg">
        <img 
          src="http://172.25.202.31:4747/video" 
          alt="Live Drone Feed" 
          className="absolute top-0 left-0 w-full h-full object-cover" 
        />
      </div>

      {/* 2. Your Custom Neumorphism Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        .neu-flat {
          border-radius: 20px;
          background: #e0e5ec;
          box-shadow: 9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.6);
        }
        
        .neu-pressed {
          border-radius: 12px;
          background: #e0e5ec;
          box-shadow: inset 6px 6px 10px 0 rgba(163,177,198, 0.7), inset -6px -6px 10px 0 rgba(255,255,255, 0.6);
        }
      `}</style>
    </>
  );
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem' }}>
        <h1 style={{ fontFamily: '"Playfair Display", serif', color: '#1a202c', fontSize: '2.5rem', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>
          <span style={{ color: '#2563eb' }}>6IX LIFEBOT</span> <span style={{ color: '#718096', fontWeight: '700', fontSize: '1.8rem', fontStyle: 'italic' }}>/ Medical Emergency Drone</span>
        </h1>
        <div className="neu-flat" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '50px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></div>
          <span style={{ color: '#047857', fontWeight: '700', letterSpacing: '0.5px', fontSize: '0.85rem' }}>LINK ACTIVE</span>
        </div>
      </header>
      
      {/* MAIN GRID */}
      <div style={{ display: 'flex', gap: '2.5rem', height: '75vh' }}>
        
        {/* LEFT: THE MAP */}
        <div className="neu-pressed" style={{ flex: '2.5', overflow: 'hidden', position: 'relative', border: '4px solid #e0e5ec' }}>
          <MapContainer center={currentPosition} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Polyline positions={flightPath} color="#2563eb" weight={5} opacity={0.8} />
            <Marker position={currentPosition} icon={droneIcon} />
          </MapContainer>
        </div>

        {/* RIGHT: THE SIDEBAR */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* CAMERA FEED */}
          <div className="neu-flat" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#4a5568', fontSize: '0.85rem', margin: 0, letterSpacing: '1.5px', fontWeight: '700' }}>ESP32-CAM LINK</h2>
            </div>
            
            <div className="neu-pressed" style={{ height: '180px', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="scanner-line"></div>
              <span style={{ color: '#718096', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '1px', zIndex: 10 }}>
                WAITING FOR SIGNAL...
              </span>
            </div>
          </div>

          {/* TELEMETRY */}
          <div className="neu-flat" style={{ padding: '1.5rem', flexGrow: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h2 style={{ color: '#4a5568', fontSize: '0.85rem', margin: '0 0 1rem 0', letterSpacing: '1.5px', fontWeight: '700' }}>LIVE TELEMETRY</h2>
            
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div className="neu-pressed" style={{ flex: 1, padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#718096', margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: '700' }}>ALTITUDE</p>
                <p style={{ fontSize: '2.2rem', margin: '0', fontWeight: '800', color: '#2d3748' }}>
                  {telemetry.alt} <span style={{ fontSize: '1rem', color: '#a0aec0', fontWeight: '600' }}>m</span>
                </p>
              </div>

              <div className="neu-pressed" style={{ flex: 1, padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#718096', margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: '700' }}>SPEED</p>
                <p style={{ fontSize: '2.2rem', margin: '0', fontWeight: '800', color: '#2d3748' }}>
                  {telemetry.speed} <span style={{ fontSize: '1rem', color: '#a0aec0', fontWeight: '600' }}>m/s</span>
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <p style={{ color: '#718096', margin: '0', fontSize: '0.8rem', fontWeight: '700' }}>PAYLOAD BATTERY</p>
                <p style={{ margin: '0', fontWeight: '800', fontSize: '1rem', color: telemetry.battery > 20 ? '#10b981' : '#ef4444' }}>
                  {telemetry.battery}%
                </p>
              </div>
              
              <div className="neu-pressed" style={{ height: '16px', padding: '3px' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${telemetry.battery}%`, 
                  backgroundColor: telemetry.battery > 20 ? '#10b981' : '#ef4444',
                  transition: 'width 0.5s ease-in-out',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.2)'
                }}></div>
              </div>
            </div>

            {/* NEW: THE INTERACTIVE DEPLOY BUTTON */}
            <button 
              className="neu-btn" 
              onClick={handleDeployPayload}
              style={{
                color: deployStatus === 'STANDBY' ? '#ef4444' : deployStatus === 'DEPLOYING' ? '#f59e0b' : '#10b981',
                boxShadow: deployStatus !== 'STANDBY' ? 'inset 4px 4px 8px rgba(163,177,198, 0.7), inset -4px -4px 8px rgba(255,255,255, 0.8)' : ''
              }}
            >
              {deployStatus === 'STANDBY' && '⚠ DEPLOY MEDICAL PAYLOAD'}
              {deployStatus === 'DEPLOYING' && '⚙ OPENING SERVO CLAW...'}
              {deployStatus === 'SUCCESS' && '✔ PAYLOAD RELEASED'}
            </button>

          </div>
        </div>
      </div>
}

export default App