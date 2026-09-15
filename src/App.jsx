import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import L from 'leaflet';

// ⚠️ IMPORTANT: Render URL Updated here!
const socket = io('https://lifebot-backend-u26q.onrender.com');

const droneIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/9357/9357591.png',
  iconSize: [45, 45],
  iconAnchor: [22, 22]
});

export default function App() {
  // Starting coordinates centered near Bangalore
  const [currentPosition, setCurrentPosition] = useState([12.9716, 77.5946]);
  const [flightPath, setFlightPath] = useState([[12.9716, 77.5946]]);
  const [telemetry, setTelemetry] = useState({ alt: 0, speed: 0, battery: 100 });
  
  // NEW: State to track our payload button animation
  const [deployStatus, setDeployStatus] = useState('STANDBY');

  useEffect(() => {
    socket.on('telemetry_update', (data) => {
      if (data.lat && data.lng) {
        const newPos = [data.lat, data.lng];
        setCurrentPosition(newPos);
        setFlightPath(prevPath => [...prevPath, newPos]);
        
        // Update other metrics if provided
        setTelemetry({
          alt: data.alt || telemetry.alt,
          speed: data.speed || telemetry.speed,
          battery: data.battery || telemetry.battery
        });
      }
    });

    // Cleanup prevents the infinite loop crash!
    return () => {
      socket.off('telemetry_update');
    };
  }, []); 

  const handleDeployPayload = () => {
    setDeployStatus('DEPLOYING...');
    setTimeout(() => {
      setDeployStatus('PAYLOAD RELEASED');
      setTimeout(() => {
        setDeployStatus('STANDBY');
      }, 4000);
    }, 2000);
  };

  return (
    <>
      <div className="min-h-screen bg-[#e0e5ec] p-8 font-sans text-gray-800">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-700">CELERITAS 6IX LIFEBOT</h1>
          <p className="text-sm text-gray-500 mt-1">Live Mission Control Dashboard</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Video & Telemetry */}
          <div className="space-y-8">
            
            {/* 1. Live Video Feed (DroidCam) */}
            <div className="neu-flat p-4">
              <div className="w-full relative aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
                <img 
                  src="http://172.25.202.31:4747/video" 
                  alt="Live Drone Feed" 
                  className="absolute top-0 left-0 w-full h-full object-cover" 
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded animate-pulse shadow-md">
                  LIVE
                </div>
              </div>
            </div>

            {/* 2. Telemetry Panel */}
            <div className="neu-flat p-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Altitude</p>
                <p className="text-2xl font-black text-gray-700">{telemetry.alt} m</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Speed</p>
                <p className="text-2xl font-black text-gray-700">{telemetry.speed} km/h</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Battery</p>
                <p className="text-2xl font-black text-green-600">{telemetry.battery}%</p>
              </div>
            </div>
            
            {/* 3. Payload Deployment Button */}
            <div className="neu-flat p-6 flex flex-col items-center justify-center">
               <button 
                onClick={handleDeployPayload}
                disabled={deployStatus !== 'STANDBY'}
                className={`w-full py-4 rounded-xl font-black text-xl tracking-widest transition-all duration-300 ${
                  deployStatus === 'STANDBY' 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-red-500/50' 
                    : 'neu-pressed text-gray-400 cursor-not-allowed'
                }`}
              >
                {deployStatus}
              </button>
            </div>
          </div>

          {/* Right Column: GPS Map */}
          <div className="neu-flat p-4 h-[700px] flex flex-col">
            <h2 className="text-lg font-bold text-gray-700 mb-4 px-2">GPS Tracking</h2>
            <div className="flex-grow rounded-lg overflow-hidden shadow-inner relative z-0">
              <MapContainer center={currentPosition} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <Marker position={currentPosition} icon={droneIcon} />
                <Polyline positions={flightPath} color="#ef4444" weight={4} opacity={0.8} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Neumorphism CSS */}
      <style>{`
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
        /* Leaflet overrides to prevent z-index issues with absolute divs */
        .leaflet-container {
          z-index: 10 !important;
        }
      `}</style>
    </>
  );
}