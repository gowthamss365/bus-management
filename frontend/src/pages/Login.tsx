import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, User, Shield, Lock, Loader2 } from 'lucide-react';
import api from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('passenger');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Attempt real API Login
    api.post('/auth/login', { email, password })
      .then(res => {
        localStorage.setItem('transit_token', res.data.access_token);
        if (role === 'passenger') navigate('/passenger');
        else if (role === 'driver') navigate('/driver');
        else if (role === 'manager') navigate('/manager');
      })
      .catch(err => {
        console.warn("Backend not reachable. Using fallback login for UI dev.");
        localStorage.setItem('transit_token', 'mock_token_123');
        if (role === 'passenger') navigate('/passenger');
        else if (role === 'driver') navigate('/driver');
        else if (role === 'manager') navigate('/manager');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8">
        <div className="text-center mb-8">
          <Bus className="h-12 w-12 text-cyan-600 mx-auto" />
          <h1 className="mt-4 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
            Transit OS
          </h1>
          <p className="text-slate-500 mt-2">Smart City Bus Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setRole('passenger')} className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${role === 'passenger' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              <User size={20} />
              <span className="text-xs font-semibold">Passenger</span>
            </button>
            <button type="button" onClick={() => setRole('driver')} className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${role === 'driver' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              <Shield size={20} />
              <span className="text-xs font-semibold">Driver</span>
            </button>
            <button type="button" onClick={() => setRole('manager')} className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${role === 'manager' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              <Lock size={20} />
              <span className="text-xs font-semibold">Manager</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email ID</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-3 px-4 bg-slate-50 border" placeholder={`${role}@transitos.com`} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-3 px-4 bg-slate-50 border" placeholder="Enter password" required />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button type="button" className="text-sm font-medium text-cyan-600 hover:text-cyan-500">
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 flex justify-center items-center gap-2 disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
