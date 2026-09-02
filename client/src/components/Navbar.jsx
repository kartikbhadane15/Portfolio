import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onOpenRecruiterView, profileName, username }) {
  const [theme, setTheme] = useState('dark');
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with Magic Key (3 continuous clicks reveal secret Admin button) */}
          <div className="flex-shrink-0 select-none">
            <Link 
              to={basePath || '/'} 
              onClick={handleLogoClick}
              className="text-xl font-extrabold tracking-tighter text-gray-900 dark:text-white hover:text-cyan-accent dark:hover:text-cyan-accent transition-transform active:scale-95 cursor-pointer inline-block"
            >
              {logoText}<span className="text-cyan-accent">.</span>
            </Link>
          </div>

          {/* Center Links */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-8">
              <a href={getSectionHref('#about')} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">About</a>
              <a href={getSectionHref('#experience')} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Experience</a>
              <Link to={`${basePath}/projects`} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Projects</Link>
              <a href={getSectionHref('#skills')} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Skills</a>
              <a href={getSectionHref('#credentials')} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Credentials</a>
              <a href={getSectionHref('#contact')} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onOpenRecruiterView}
              className="px-3.5 py-1.5 rounded-full bg-cyan-accent/10 border border-cyan-accent/40 text-cyan-accent text-xs font-bold hover:bg-cyan-accent hover:text-black transition-all flex items-center shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer"
              title="Open 30-second executive summary for recruiters"
            >
              <span className="hidden sm:inline">Recruiter View</span>
              <span className="sm:hidden">TL;DR</span>
            </button>

            <button 
              onClick={toggleTheme} 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors cursor-pointer px-1"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>

            <a 
              href="/resume.pdf" 
              className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              Resume
            </a>

            {/* Hidden Secret Admin Button - ONLY unhides when logo is clicked 3 times consecutively */}
            {showAdminButton && (
              <Link 
                to="/admin" 
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50 hover:bg-purple-500 hover:text-white transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.35)] animate-pulse"
                title="Admin Control Panel (Unlocked)"
              >
                <span>🔐</span>
                <span>Admin</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
