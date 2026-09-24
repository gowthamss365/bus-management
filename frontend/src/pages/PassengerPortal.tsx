import React, { useState, useEffect } from 'react';
import api from '../api';
import { CreditCard, MapPin, Zap, Navigation2, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';

export default function PassengerPortal() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedBuses, setSuggestedBuses] = useState<any[]>([]);

  useEffect(() => {
    // Attempt to fetch UTC Card from backend
    api.get('/utc/card')
      .then(res => {
        setBalance(res.data.balance);
      })
      .catch(err => {
        console.error("Failed to fetch wallet balance from real backend API", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
      
    // Fetch live suggested buses
    api.get('/buses/live')
      .then(res => {
        const mappedBuses = res.data.map((bus: any) => ({
          id: bus.id,
          type: bus.bus_type || 'City Commuter',
          crowd: bus.occupancy < 30 ? 'LOW CROWD' : bus.occupancy > 70 ? 'HIGH CROWD' : 'MEDIUM CROWD',
          crowdColor: bus.occupancy < 30 ? 'bg-green-100 text-green-700' : bus.occupancy > 70 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
          lat: bus.latitude,
          lng: bus.longitude,
          exactTime: new Date(Date.now() + 1000 * 60 * 5).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          eta: '5 min',
          occupancy: `${bus.occupancy || 0}%`
        }));
        setSuggestedBuses(mappedBuses);
      })
      .catch(err => console.error("Failed to fetch buses", err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Good Morning, John</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" /> Verified Smart Commuter
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-500">Frequent Route</p>
            <p className="text-lg font-bold text-slate-800">108 • Central to Airport</p>
          </div>
        </div>
        
        {/* UTC Wallet Mini */}
        <div className="glass-card p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard className="h-24 w-24" />
          </div>
          <h3 className="text-slate-300 font-medium">Transit Mini-Wallet</h3>
          <p className="text-3xl font-bold mt-2">
            {isLoading ? '₹...' : `₹${balance?.toFixed(2)}`}
          </p>
          <div className="mt-4 flex gap-2 relative z-10">
            <button className="bg-cyan-500 hover:bg-cyan-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              SCAN / TAP
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              ADD MONEY
            </button>
          </div>
        </div>
      </div>

      {/* Live AI Transit Advisor */}
      <div className="glass-card p-5 border-l-4 border-l-amber-500 bg-amber-50/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-slate-800 text-lg">AI Live Transit Advisor</h3>
            <div className="mt-3 space-y-3">
              <div className="flex gap-2 items-start">
                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-red-600">Traffic Jam:</span> Route 112 is experiencing heavy traffic delay. We recommend switching to <strong className="text-cyan-700 cursor-pointer hover:underline">BUS 105</strong> for a faster commute.
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-amber-600">Overcrowding Alert:</span> BUS 112 is at 92% capacity. For a guaranteed seat and a cooler ride, wait 4 more minutes for <strong className="text-cyan-700 cursor-pointer hover:underline">BUS 108</strong> (AC Commuter).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commute Planner */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-cyan-500" />
              <h2 className="text-xl font-bold text-slate-800">Plan Real-Time Commute</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <MapPin className="text-slate-400" />
                <input type="text" value="Central Station" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-cyan-500" readOnly />
              </div>
              <div className="flex gap-4 items-center">
                <Navigation2 className="text-slate-400" />
                <input type="text" value="Airport T3" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-cyan-500" readOnly />
              </div>
              
              <div className="pt-4 flex gap-2 overflow-x-auto">
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold whitespace-nowrap">LOW CROWD</button>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold whitespace-nowrap">FASTEST</button>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold whitespace-nowrap">LOWEST FARE</button>
              </div>

              <button className="w-full btn-primary mt-4">
                FIND BUSES
              </button>
            </div>
          </div>
          
          {/* Smart Recommendation */}
          <div className="glass-card p-6 border-l-4 border-l-green-500">
            <h3 className="font-bold text-slate-800 mb-2 text-lg">AI Dynamic Dispatch Sync</h3>
            <p className="text-sm text-slate-500 mb-4">Based on crowd, ETA, and capacity.</p>
            
            <div className="space-y-4">
              {suggestedBuses.map((bus) => (
                <div key={bus.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:border-cyan-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">BUS {bus.id}</h4>
                      <p className="text-sm text-slate-500">{bus.type}</p>
                    </div>
                    <span className={`${bus.crowdColor} px-3 py-1 rounded-full text-xs font-bold`}>{bus.crowd}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 my-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">ETA</p>
                      <p className="font-bold text-slate-800">{bus.eta} <span className="text-xs text-slate-500 font-normal">({bus.exactTime})</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Occupancy</p>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800">{bus.occupancy}</p>
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5 w-16">
                          <div className={`h-1.5 rounded-full ${bus.crowd === 'LOW CROWD' ? 'bg-green-500' : bus.crowd === 'HIGH CROWD' ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: bus.occupancy }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-slate-900 text-white font-semibold py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    SELECT & RESERVE
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Radar */}
        <div className="lg:col-span-2 glass-card p-6 h-[600px] flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Route Live Radar</h2>
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-200">
            <MapContainer center={[12.9716, 77.5946]} zoom={13} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {/* Destination/Stop Marker */}
              <Marker position={[12.9716, 77.5946]}>
                <Popup>Central Station (Your Stop)</Popup>
              </Marker>

              {/* Live Bus Markers */}
              {suggestedBuses.filter(bus => bus.lat != null && bus.lng != null).map((bus) => (
                <Marker key={bus.id} position={[bus.lat, bus.lng]}>
                  <Tooltip permanent direction="top" className="font-bold text-slate-800 rounded shadow-sm border border-cyan-200">
                    BUS {bus.id}
                  </Tooltip>
                  <Popup>
                    <div className="font-sans">
                      <strong className="text-slate-800">BUS {bus.id}</strong><br/>
                      <span className="text-sm text-slate-600">{bus.crowd} • {bus.occupancy}</span><br/>
                      <span className="text-xs text-cyan-600 font-bold">Arriving at {bus.exactTime}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

