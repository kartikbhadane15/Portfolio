import { Link } from 'react-router-dom';

export default function NoPortfolio() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center p-6 text-center select-none transition-colors">
      <div className="w-16 h-16 mb-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
        No Portfolio Specified
      </h1>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed mb-8">
        No developer handle was specified in this URL. Please use the direct link provided by the portfolio owner (e.g.{' '}
        <span className="font-mono text-cyan-accent bg-cyan-500/10 px-1.5 py-0.5 rounded">/username</span>).
      </p>

      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
        Are you an account owner?{' '}
        <Link to="/admin" className="text-slate-900 dark:text-white font-medium hover:underline transition-colors ml-1">
          Admin Sign In &rarr;
        </Link>
      </div>
    </div>
  );
}
