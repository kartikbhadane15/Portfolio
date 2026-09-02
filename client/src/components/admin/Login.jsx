import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      // Save token and user details
      localStorage.setItem('adminToken', data.token);
      if (data.user) {
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      }
      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative">
      <Link 
        to="/kartik" 
        className="absolute top-6 right-6 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Portfolio
      </Link>
      
      <div className="w-full max-w-[400px] bg-[#111111] border border-gray-800 rounded-2xl p-8 sm:p-10 shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Kartik Portfolio</h2>
          <p className="text-gray-400 text-sm">Admin Login</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white tracking-wide">Email</label>
            <input 
              type="email" 
              placeholder="admin@kartikbhadane.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white tracking-wide">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-800 bg-black text-cyan-accent focus:ring-cyan-accent focus:ring-offset-black" />
              <span className="text-xs text-gray-400 font-medium">Remember me</span>
            </label>
            <a href="#" className="text-xs text-cyan-accent font-medium hover:underline">
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#EEEEEE] hover:bg-white text-black font-bold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}
