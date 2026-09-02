import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchAdminStats } from '../../utils/api';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const getStoredUser = () => {
    try {
      const u = localStorage.getItem('adminUser');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  };

  const [currentUser, setCurrentUser] = useState(getStoredUser);

  // Load message stats and user details
  useEffect(() => {
    fetchAdminStats()
      .then(stats => {
        if (stats) {
          if (stats.unreadMessages !== undefined) {
            setUnreadMessagesCount(stats.unreadMessages);
          }
          if (stats.userRole || stats.username) {
            const userData = { role: stats.userRole, username: stats.username };
            setCurrentUser(userData);
            localStorage.setItem('adminUser', JSON.stringify(userData));
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load admin stats in layout:', err);
      });
  }, [location.pathname]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin');
  };

  const isSuperadmin = currentUser?.role === 'superadmin';

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Messages', path: '/admin/messages', badge: unreadMessagesCount, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Projects', path: '/admin/projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Experience', path: '/admin/experience', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Profile', path: '/admin/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { name: 'Skills', path: '/admin/skills', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { name: 'More', path: '/admin/more', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    ...(isSuperadmin ? [
      { name: 'Users', path: '/admin/users', isSuperadmin: true, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
    ] : []),
    { name: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white flex transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 flex flex-col hidden md:flex transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Portfolio Admin</h2>
            {isSuperadmin && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                👑 Superadmin
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-mono text-cyan-accent font-semibold">
              @{currentUser?.username || 'kartik'}
            </span>
            <a
              href={`/${currentUser?.username || 'kartik'}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-gray-400 hover:text-cyan-accent hover:underline flex items-center gap-0.5"
            >
              <span>Live Site</span> &rarr;
            </a>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? item.isSuperadmin 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' 
                      : 'bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span className="flex-1 flex items-center gap-2">
                  {item.name}
                  {item.isSuperadmin && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                      Super
                    </span>
                  )}
                </span>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-accent text-black">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
          <div className="mt-4 px-4 text-xs text-gray-500 dark:text-gray-600">
            <Link to={`/${currentUser?.username || 'kartik'}`} className="hover:text-gray-900 dark:hover:text-gray-400 transition-colors">
              View My Portfolio ({currentUser?.username ? `@${currentUser.username}` : '/kartik'}) ↗
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 transition-colors">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Dashboard
            {isSuperadmin && (
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Superadmin
              </span>
            )}
          </h1>
          <div className="flex items-center gap-4">
            <div 
              onClick={toggleTheme}
              className="flex items-center gap-2 cursor-pointer bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-full px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors"
            >
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm ${
              isSuperadmin ? 'bg-purple-400 ring-2 ring-purple-500/40' : 'bg-cyan-accent'
            }`}>
              {currentUser?.username?.[0]?.toUpperCase() || 'K'}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-[#050505] transition-colors">
          <Outlet />
        </div>

      </main>
    </div>
  );
}
