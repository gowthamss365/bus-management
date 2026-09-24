import React, { useState, useEffect } from 'react';
import { AlertOctagon, Navigation, Users, Clock, Radio, Key, Gauge, MessageSquareWarning, Timer, Accessibility, PhoneCall, Settings, Wrench } from 'lucide-react';
import api from '../api';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

export default function DriverCockpit() {
  const [trip, setTrip] = useState<any>(null);

  useEffect(() => {
    // Attempt to fetch active trip from backend
    api.get('/driver/active-trip')
      .then(res => setTrip(res.data))
      .catch(err => {
        console.error("Failed to fetch active trip from real backend API", err);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Trip Control Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1">{trip ? trip.driver_name : '...'}</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">ID: {trip ? trip.driver_id : '...'} • Route {trip ? trip.route : '...'}</p>
            
            <div className="bg-slate-900 text-white p-4 rounded-xl text-center mb-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">ACTIVE TRIP</p>
              <p className="text-3xl font-mono">00:57:36</p>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors">
                START TRIP
              </button>
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors">
                PAUSE TRIP
              </button>
              <button className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-xl transition-colors">
                END TRIP
              </button>
            </div>
          </div>

          {/* Occupancy Sensor */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-cyan-500 h-5 w-5" /> Live Occupancy
              </h3>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">MEDIUM CROWD</span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-3xl font-bold text-slate-800">{trip ? trip.occupancy : '...'}</span>
                <span className="text-slate-500">/ {trip ? trip.capacity : '...'} Capacity</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-right text-xs font-bold text-cyan-600 mt-1">70% Occupancy</p>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div>Seated</span><span className="font-bold">{trip ? trip.seated : '-'}</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Standing</span><span className="font-bold">{trip ? trip.standing : '-'}</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300"></div>Vacant</span><span className="font-bold">{trip ? trip.vacant : '-'}</span></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 text-center">Counted automatically via computer vision + UTC data.</p>
          </div>

          {/* Dispatch Advisory */}
          <div className="glass-card p-6 border-l-4 border-amber-500 bg-amber-50/50">
            <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-2">
              <MessageSquareWarning className="h-5 w-5 text-amber-600" /> Dispatch Advisory
            </h3>
            <p className="text-sm text-amber-800">
              <span className="font-bold">Next Stop (City College):</span> 12 passengers have confirmed reservations via App. Ensure doors 2 & 3 are clear for priority boarding.
            </p>
          </div>
        </div>

        {/* Main Navigation Map */}
        <div className="md:col-span-3 space-y-6">
          <div className="glass-card p-6 h-[500px] flex flex-col relative z-0">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Live Navigation to Airport T3</h2>
                <div className="flex gap-3 mt-2">
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Radio size={14} /> GPS: OPTIMAL
                  </div>
                  <div className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-cyan-200">
                    <Timer size={14} /> INTERVAL: 12 MIN (ON TIME)
                  </div>
                </div>
              </div>

              {/* Digital Speedometer */}
              <div className="flex flex-col items-center bg-slate-900 text-white px-6 py-2 rounded-xl shadow-lg border-2 border-slate-700">
                <Gauge className="text-cyan-400 mb-1" size={20} />
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-bold text-cyan-400">44</span>
                  <span className="text-xs text-slate-400 font-bold">KM/H</span>
                </div>
              </div>
            </div>

            {/* Prominent Next Stop Banner */}
            <div className="bg-slate-800 text-white p-3 rounded-lg mb-4 flex justify-between items-center shadow-inner border border-slate-700">
              <div className="flex items-center gap-3">
                <span className="bg-cyan-500 text-slate-900 px-2 py-1 rounded font-bold text-xs uppercase tracking-wider animate-pulse">NEXT STOP</span>
                <span className="font-bold text-xl text-cyan-50">City College</span>
              </div>
              <span className="text-sm font-medium text-slate-300 bg-slate-700 px-3 py-1 rounded-full">2.4 km • 4 mins away</span>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 relative z-10">
              <MapContainer center={[13.0800, 77.6500]} zoom={11} scrollWheelZoom={false} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                <Polyline positions={[[12.9780, 77.6040], [13.0500, 77.6200], [13.1989, 77.7068]]} color="#06b6d4" weight={5} opacity={0.8} />
                
                <Marker position={[12.9780, 77.6040]}>
                  <Popup>Current Location: Market Plaza</Popup>
                </Marker>
                <Marker position={[13.1989, 77.7068]}>
                  <Popup>Destination: Airport T3</Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* EMERGENCY SOS BUTTON */}
            <button 
              onClick={() => {
                api.post('/emergency/sos', { bus_id: trip?.bus_id || 1, route_id: trip?.route_id || 1, passenger_count: 20, latitude: 12.9780, longitude: 77.6040, emergency_type: 'MEDICAL', message: 'Driver triggered SOS' })
                  .then(() => alert("SOS Triggered Successfully! OCC Notified."))
                  .catch(err => alert("Failed to trigger SOS: " + err.message));
              }}
              className="absolute bottom-10 left-10 btn-danger flex items-center gap-2 text-xl py-4 px-8 animate-pulse z-[1000] shadow-red-500/50 border-2 border-white">
              <AlertOctagon size={28} />
              EMERGENCY SOS
            </button>
          </div>

          {/* Route Matrix */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-slate-800 mb-4">Interactive Route Stop Matrix</h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-300 border-4 border-white shadow flex items-center justify-center mb-2"></div>
                <span className="text-xs text-slate-500 font-medium text-center w-20">Central Terminus</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-cyan-500 border-4 border-white shadow flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-xs text-cyan-600 font-bold text-center w-20">Market Plaza</span>
                <span className="text-[10px] text-slate-400 bg-white px-1">CURRENT</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 border-4 border-cyan-300 shadow flex items-center justify-center mb-2"></div>
                <span className="text-xs text-slate-800 font-bold text-center w-24">City College</span>
                <span className="text-[10px] text-amber-500 bg-white px-1 font-bold mt-1 border border-amber-200 rounded">18 WAITING</span>
                <span className="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 font-bold mt-1 rounded-full shadow-sm">12 RESERVED</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-200 border-4 border-white shadow flex items-center justify-center mb-2"></div>
                <span className="text-xs text-slate-500 font-medium text-center w-24">Tech Hub</span>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1 font-bold mt-1 border border-slate-200 rounded">5 WAITING</span>
                <span className="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 font-bold mt-1 rounded-full shadow-sm">3 RESERVED</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-800 border-4 border-white shadow flex items-center justify-center mb-2">
                  <Navigation size={12} className="text-white" />
                </div>
                <span className="text-xs text-slate-500 font-medium text-center w-20">Airport T3</span>
              </div>
            </div>
          </div>

          {/* Driver Action Center */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="glass-card p-4 flex flex-col items-center justify-center gap-3 hover:bg-cyan-50 transition-all duration-300 border-2 border-transparent hover:border-cyan-300 hover:-translate-y-1 group">
              <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                <Accessibility className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-800 text-sm block">Deploy Ramp</span>
                <span className="text-[10px] text-slate-500">Wheelchair Access</span>
              </div>
            </button>
            <button className="glass-card p-4 flex flex-col items-center justify-center gap-3 hover:bg-green-50 transition-all duration-300 border-2 border-transparent hover:border-green-300 hover:-translate-y-1 group">
              <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                <PhoneCall className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-800 text-sm block">Voice Call OCC</span>
                <span className="text-[10px] text-slate-500">Control Center</span>
              </div>
            </button>
            <button className="glass-card p-4 flex flex-col items-center justify-center gap-3 hover:bg-amber-50 transition-all duration-300 border-2 border-transparent hover:border-amber-300 hover:-translate-y-1 group">
              <div className="bg-amber-100 p-3 rounded-full group-hover:bg-amber-200 transition-colors">
                <Wrench className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-800 text-sm block">Report Issue</span>
                <span className="text-[10px] text-slate-500">Mechanical / Delay</span>
              </div>
            </button>
            <button className="glass-card p-4 flex flex-col items-center justify-center gap-3 hover:bg-slate-100 transition-all duration-300 border-2 border-transparent hover:border-slate-300 hover:-translate-y-1 group">
              <div className="bg-slate-200 p-3 rounded-full group-hover:bg-slate-300 transition-colors">
                <Settings className="h-8 w-8 text-slate-700" />
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-800 text-sm block">Bus Controls</span>
                <span className="text-[10px] text-slate-500">AC, Lights, Doors</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
