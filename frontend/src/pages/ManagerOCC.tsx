import { useState, useEffect } from 'react';
import { Bus, Users, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import api from '../api';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';

export default function ManagerOCC() {
  const [stats, setStats] = useState<any>(null);
  const [fleetBuses, setFleetBuses] = useState<any[]>([]);

  useEffect(() => {
    api.get('/manager/analytics')
      .then(res => setStats(res.data))
      .catch(err => console.error("Failed to fetch analytics from real backend API", err));
      
    api.get('/buses/live')
      .then(res => {
        const mappedFleet = res.data.map((bus: any) => ({
          id: bus.id,
          driver: 'Driver ID ' + (bus.current_driver_id || 'N/A'),
          route: 'Route ' + (bus.current_route_id || 'N/A'),
          destination: 'Stop ' + (bus.next_stop_id || 'N/A'),
          status: bus.status === 'AVAILABLE' ? 'ON_TIME' : bus.status,
          eta: '10 min',
          nextStop: 'Stop ' + (bus.next_stop_id || 'N/A'),
          occupancy: `${bus.occupancy || 0}%`,
          speed: `${bus.speed || 0} km/h`,
          health: 'Optimal',
          lat: bus.latitude,
          lng: bus.longitude
        }));
        setFleetBuses(mappedFleet);
      })
      .catch(err => console.error("Failed to fetch fleet buses from real backend API", err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Metropolitan Transit Operations Center</h1>
          <p className="text-slate-500">Live AI Fleet Management & Allocation Dashboard</p>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Total Fleet" value={stats ? stats.total_fleet : '...'} icon={<Bus size={20} className="text-blue-500" />} />
        <KPICard title="Active on Route" value={stats ? stats.active_buses : '...'} icon={<Bus size={20} className="text-green-500" />} trend="+4%" />
        <KPICard title="Passengers Today" value={stats ? stats.passengers_today.toLocaleString() : '...'} icon={<Users size={20} className="text-cyan-500" />} />
        <KPICard title="Avg Occupancy" value={stats ? `${stats.average_occupancy.toFixed(0)}%` : '...'} icon={<TrendingUp size={20} className="text-indigo-500" />} />
        <KPICard title="Delayed Buses" value={stats ? stats.delayed_buses : '...'} icon={<AlertTriangle size={20} className="text-amber-500" />} danger />
        <KPICard title="Demand Spikes" value={stats ? stats.demand_spikes : '...'} icon={<TrendingUp size={20} className="text-purple-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Fleet Map */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Live Fleet Corridor Spatial Map</h2>
            <div className="flex gap-2">
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:bg-slate-200">All</span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold cursor-pointer border border-red-200">Emergency (0)</span>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold cursor-pointer">Delayed (8)</span>
            </div>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 relative">
            <MapContainer center={[12.9716, 77.5946]} zoom={12} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {fleetBuses.filter(bus => bus.lat != null && bus.lng != null).map(bus => (
                <Marker key={bus.id} position={[bus.lat, bus.lng]}>
                  <Tooltip permanent direction="top" className="font-bold text-slate-800 rounded shadow-sm border border-slate-200">
                    <div className="text-center">
                      <span className="block text-xs">BUS {bus.id}</span>
                      <span className={`text-[10px] ${bus.status === 'DELAYED' ? 'text-red-600' : bus.status === 'MAINTENANCE' ? 'text-amber-600' : 'text-cyan-600'}`}>ETA: {bus.eta}</span>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="font-sans">
                      <strong className="text-slate-800 text-lg">BUS {bus.id}</strong><br/>
                      <span className="text-sm text-slate-600 font-bold">Route: {bus.route}</span><br/>
                      <span className="text-xs text-slate-500">Destination: {bus.destination}</span><br/>
                      <span className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded ${bus.status === 'DELAYED' ? 'bg-red-100 text-red-700' : bus.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{bus.status}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          
          {/* AI Allocation Engine */}
          <div className="glass-card p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-purple-500" />
              <h2 className="text-lg font-bold text-slate-800">AI Allocation Engine</h2>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
              <h3 className="font-bold text-slate-700 mb-1">Route 108</h3>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500">Current Demand: HIGH</span>
                <span className="text-purple-600 font-bold">Predicted: VERY HIGH</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">Recommend deploying <span className="font-bold text-slate-900">3 additional buses</span> from reserve fleet.</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg text-sm transition-colors">
                  APPROVE
                </button>
                <button className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 rounded-lg text-sm transition-colors">
                  REJECT
                </button>
              </div>
            </div>
          </div>

          {/* AI Event Predictor */}
          <div className="glass-card p-6 border-l-4 border-l-cyan-500">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-cyan-500" />
              <h2 className="text-lg font-bold text-slate-800">AI Event Predictor</h2>
            </div>
            <div className="bg-cyan-50/50 rounded-xl p-4 border border-cyan-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-cyan-900">Diwali Festival Weekend</h3>
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold animate-pulse">IN 3 DAYS</span>
              </div>
              <p className="text-sm text-cyan-800 mb-3">
                Historical data predicts a <strong className="text-red-600">+45% demand spike</strong> on routes passing through City Center and Commercial Street.
              </p>
              <p className="text-sm text-cyan-800 mb-4 border-t border-cyan-200 pt-3">
                <strong>AI Recommendation:</strong> Allocate <strong className="text-slate-900">8 extra buses</strong> from the reserve fleet to Route 108 and Route 112 starting Friday at 16:00.
              </p>
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-md">
                SCHEDULE EXTRA BUSES
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Live Fleet Roster */}
      <div className="glass-card p-6 overflow-x-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Bus className="text-blue-500" /> Comprehensive Fleet Roster
        </h2>
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-sm">
              <th className="py-3 px-4 font-bold">Bus ID</th>
              <th className="py-3 px-4 font-bold">Driver</th>
              <th className="py-3 px-4 font-bold">Route</th>
              <th className="py-3 px-4 font-bold">Status</th>
              <th className="py-3 px-4 font-bold">ETA / Next Stop</th>
              <th className="py-3 px-4 font-bold">Occupancy</th>
              <th className="py-3 px-4 font-bold">Speed</th>
              <th className="py-3 px-4 font-bold">Health</th>
            </tr>
          </thead>
          <tbody>
            {fleetBuses.map((bus) => (
              <tr key={bus.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-800">BUS {bus.id}</td>
                <td className="py-4 px-4 text-slate-600 font-medium">{bus.driver}</td>
                <td className="py-4 px-4 text-slate-600 font-bold">{bus.route}</td>
                <td className="py-4 px-4">
                  <span className={`text-xs font-bold inline-block px-2 py-1 rounded ${bus.status === 'DELAYED' ? 'bg-red-100 text-red-700' : bus.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {bus.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-600">
                  <span className="font-bold">{bus.eta}</span> <br/><span className="text-xs text-slate-400">{bus.nextStop}</span>
                </td>
                <td className="py-4 px-4 text-slate-600">
                  {bus.occupancy}
                  <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1">
                    <div className={`h-1.5 rounded-full ${parseInt(bus.occupancy) > 80 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: bus.occupancy }}></div>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-600">{bus.speed}</td>
                <td className="py-4 px-4">
                  <span className={`text-xs font-bold ${bus.health === 'Optimal' ? 'text-green-600' : 'text-red-600'}`}>
                    {bus.health}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function KPICard({ title, value, icon, trend, danger = false }: any) {
  return (
    <div className={`glass-card p-4 border-l-4 ${danger ? 'border-l-red-500' : 'border-l-cyan-500'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        {trend && <span className="text-xs font-bold text-green-500 mb-1">{trend}</span>}
      </div>
    </div>
  );
}
