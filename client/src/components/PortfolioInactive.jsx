import React from 'react';
import { Link } from 'react-router-dom';

export default function PortfolioInactive({
  username,
  isBlocked = false,
  isExpired = false,
  message = ''
}) {
  const isBlockReason = isBlocked;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#070B14] text-slate-800 dark:text-slate-200 transition-colors">
      <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 relative overflow-hidden">
        
        {/* Glow accent */}
        <div
          className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isBlockReason ? 'bg-rose-500' : 'bg-amber-500'
          }`}
        />

        {/* Status Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xs relative">
          {isBlockReason ? (
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Badge & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-mono">
            {isBlockReason ? (
              <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 px-3 py-1 rounded-full">
                Account Suspended
              </span>
            ) : (
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 px-3 py-1 rounded-full">
                Subscription Expired
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {isBlockReason ? 'Portfolio Temporarily Unavailable' : 'Portfolio Inactive'}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            {message || (
              isBlockReason
                ? `The portfolio for @${username} is temporarily unavailable because the account has been blocked by the administrator.`
                : `The subscription period for @${username}'s portfolio has concluded.`
            )}
          </p>
        </div>

        {/* Information box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 text-left space-y-1.5">
          <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Are you the account owner?
          </div>
          <p>
            This portfolio is managed under an active subscription. Contact the superadmin or log into the portal to renew or reactivate your public showcase.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/admin"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
          >
            Superadmin / User Login
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
          >
            Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
