import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onOpenRecruiterView, profileName, username }) {
  const [theme, setTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const basePath = username ? `/${username}` : '/kartik';
  const isHome = location.pathname === `/${username || 'kartik'}`;

  // Magic key: 3 consecutive clicks on the logo reveals the secret Admin button
  const [showAdminButton, setShowAdminButton] = useState(() => {
    return sessionStorage.getItem('adminUnlocked') === 'true';
  });
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleLogoClick = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 3) {
      setShowAdminButton(prev => {
        const next = !prev;
        sessionStorage.setItem('adminUnlocked', next ? 'true' : 'false');
        return next;
      });
      clickCountRef.current = 0;
    } else {
      // Allow up to 1.2 seconds between clicks
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1200);
    }
  };

  // Helper for section links
  const getSectionHref = (hash) => (isHome ? hash : `${basePath}${hash}`);

  // Logo text computation
  const getLogoText = () => {
    if (profileName) {
      const parts = profileName.trim().split(' ');
      if (parts.length > 1) {
        return `${parts[0]}${parts[parts.length - 1][0]}`;
      }
      return parts[0];
    }
    if (username) return username;
    return 'KartikB';
  };
  const logoText = getLogoText();

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'About', href: getSectionHref('#about'), isInternal: false },
    { name: 'Experience', href: getSectionHref('#experience'), isInternal: false },
    { name: 'Projects', href: `${basePath}/projects`, isInternal: true },
    { name: 'Skills', href: getSectionHref('#skills'), isInternal: false },
    { name: 'Credentials', href: getSectionHref('#credentials'), isInternal: false },
    { name: 'Contact', href: getSectionHref('#contact'), isInternal: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0A0E17]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Logo with Magic Key (3 continuous clicks reveal secret Admin button) */}
          <div className="flex-shrink-0 select-none">
            <Link 
              to={basePath || '/'} 
              onClick={handleLogoClick}
              className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white hover:text-cyan-accent dark:hover:text-cyan-accent transition-transform active:scale-95 cursor-pointer inline-flex items-center"
              title="Click 3 times to unlock admin access"
            >
              <span>{logoText}</span>
              <span className="text-cyan-accent font-mono">.</span>
            </Link>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1 sm:space-x-2">
              {navLinks.map((link) => (
                link.isInternal ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                  >
                    {link.name}
                  </a>
                )
              ))}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Recruiter View Pill */}
            <button
              onClick={onOpenRecruiterView}
              className="px-3 sm:px-3.5 py-1.5 rounded-full bg-cyan-accent/15 border border-cyan-accent/35 text-cyan-700 dark:text-cyan-accent text-xs font-bold hover:bg-cyan-accent hover:text-slate-950 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Open 30-second executive summary for recruiters"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent animate-ping hidden sm:inline-block" />
              <span className="hidden sm:inline">Recruiter View</span>
              <span className="sm:hidden font-mono">TL;DR</span>
            </button>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-accent transition-colors cursor-pointer flex items-center gap-1.5"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <>
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden md:inline">Light</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  <span className="hidden md:inline">Dark</span>
                </>
              )}
            </button>

            {/* Resume Button */}
            <a 
              href="/resume.pdf" 
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 transition-all shadow-xs"
            >
              Resume
            </a>

            {/* Hidden Secret Admin Button - Unlocked via 3 clicks on logo */}
            {showAdminButton && (
              <Link 
                to="/admin" 
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 hover:bg-cyan-accent hover:text-slate-950 transition-all flex items-center gap-1 shadow-sm animate-pulse"
                title="Admin Control Panel Unlocked"
              >
                <span>🔐</span>
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle Mobile Navigation"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0A0E17]/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((link) => (
              link.isInternal ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {link.name}
                </a>
              )
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <a 
              href="/resume.pdf" 
              target="_blank"
              rel="noreferrer"
              className="w-full text-center py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 transition-colors"
            >
              Download Resume
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
