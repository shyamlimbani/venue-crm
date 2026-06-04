import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { Mail, Lock, Loader2, LayoutDashboard } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { branding } = useBranding();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-secondary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-dark-border p-8">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            {branding?.logo ? (
              <img src={branding.logo} alt="Company Logo" className="h-24 object-contain max-w-[240px] mx-auto" />
            ) : (
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 border border-gray-200 mb-4">
                  <LayoutDashboard size={32} className="text-black" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{branding?.companyName || 'Venue CRM'}</h1>
                <p className="text-gray-500 text-sm">{branding?.tagline || 'Sign in to manage your venues'}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-dark-border text-gray-900 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                placeholder="you@venuecrm.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-dark-border text-gray-900 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500 space-y-1">
          <p>Super Admin: admin@venuecrm.com · Password: 123456</p>
          <p>Owner: owner@venuecrm.com · Password: 123456</p>
          <p>Staff: studio@venuecrm.com · Password: 123456</p>
        </div>
      </div>
    </div>
  );
}
