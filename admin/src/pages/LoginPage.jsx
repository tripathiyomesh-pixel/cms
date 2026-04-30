import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — branding */}
      <div className="hidden lg:flex w-1/2 bg-ink-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='30,5 55,17 55,43 30,55 5,43 5,17' fill='none' stroke='%23B8973E' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gold-500 flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 16 16" fill="none">
              <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.2"/>
              <polyline points="1,5 8,9 15,5" fill="none" stroke="#fff" strokeWidth="0.8"/>
              <line x1="8" y1="9" x2="8" y2="15" stroke="#fff" strokeWidth="0.8"/>
            </svg>
          </div>
          <h1 className="font-display text-4xl font-semibold text-white mb-2">
            Jewel<span className="text-gold-400">CMS</span>
          </h1>
          <p className="text-ink-400 text-sm max-w-xs mx-auto leading-relaxed">
            Premium content management for the world's finest jewellery brands
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-ink-900">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-gold-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.2"/>
              </svg>
            </div>
            <span className="font-display text-xl font-semibold text-ink-800 dark:text-ink-100">
              Jewel<span className="text-gold-500">CMS</span>
            </span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-100 mb-1">Welcome back</h2>
          <p className="text-sm text-ink-400 mb-8">Sign in to your admin account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="admin@kentech.dev"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} className="input-field pr-10"
                  placeholder="Enter password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-gold w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
