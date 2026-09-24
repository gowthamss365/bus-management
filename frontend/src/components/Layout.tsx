import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bus, User, LogOut, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Very basic role determination from URL for demo purposes
  const role = location.pathname.split('/')[1];
  const [userName, setUserName] = useState('');

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setUserName(res.data.name || `${role} User`);
      })
      .catch(() => {
        // Fallback for offline local dev
        setUserName(`Test ${role}`);
      });
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem('transit_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-cyan-600" />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
                Transit OS
              </span>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full hidden sm:block">
                99.4% On-Time
              </span>
            </div>

            {/* Center Navigation */}
            <div className="hidden sm:flex items-center space-x-8">
              <span className="text-slate-600 hover:text-cyan-600 font-medium cursor-pointer">Overview</span>
              <span className="text-cyan-600 font-semibold border-b-2 border-cyan-600 cursor-pointer capitalize">
                {role} {role === 'manager' ? 'OCC' : role === 'driver' ? 'Cockpit' : 'Portal'}
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <button className="text-slate-400 hover:text-slate-600">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="bg-cyan-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-cyan-600" />
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block capitalize">{userName || `${role} User`}</span>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
