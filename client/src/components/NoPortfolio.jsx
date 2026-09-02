import { Link } from 'react-router-dom';

export default function NoPortfolio() {
  return (
    <div className="min-h-screen bg-[#080808] text-gray-200 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 mb-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
        📁
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
        No Portfolio Available
      </h1>
      
      <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-8">
        No developer handle was specified in this URL. Please use the direct link provided by the portfolio owner (e.g. <span className="font-mono text-cyan-accent">/username</span>).
      </p>

      <div className="text-xs text-gray-600 font-mono">
        Are you an account owner?{' '}
        <Link to="/admin" className="text-gray-400 hover:text-white underline transition-colors">
          Admin Sign In &rarr;
        </Link>
      </div>
    </div>
  );
}
