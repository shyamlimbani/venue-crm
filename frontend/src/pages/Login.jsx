import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, role);
      toast.success(`Welcome back!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-luxury-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/5 via-transparent to-luxury-gold/10" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md card-luxury animate-slide-up p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-luxury-gold mb-2">Venue CRM</h1>
          <p className="text-gray-500 text-sm">Internal Management System</p>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-luxury-dark rounded-lg">
          {['admin', 'staff'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium capitalize transition-all min-h-[44px] ${
                role === r ? 'bg-luxury-gold text-luxury-black' : 'text-gray-400'
              }`}
            >
              {r} Login
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-luxury"
              placeholder="admin@venuecrm.com"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-luxury"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          Demo: admin@venuecrm.com / admin123
        </p>
      </div>
    </div>
  );
}
