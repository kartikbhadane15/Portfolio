import { useState, useEffect } from 'react';
import { fetchAdminStats } from '../../utils/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="text-gray-400">Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const isSuperadmin = stats?.userRole === 'superadmin';

  const statCards = [
    { title: 'Total Projects', value: stats?.totalProjects || 0, link: '/admin/projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { title: 'Experience Roles', value: stats?.totalExperience || 0, link: '/admin/experience', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { title: 'Total Skills', value: stats?.totalSkills || 0, link: '/admin/skills', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { title: 'Unread Messages', value: stats?.unreadMessages || 0, link: '/admin/messages', isAlert: (stats?.unreadMessages || 0) > 0, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
              Welcome back, {stats?.username ? `@${stats.username}` : 'Kartik'}
            </h2>
            {isSuperadmin && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                👑 Superadmin
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">
            Here is what's happening with your portfolio today.
          </p>
        </div>

        <a
          href={`/${stats?.username || 'kartik'}`}
          target="_blank"
          rel="noreferrer"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-cyan-accent hover:text-cyan-accent transition-colors flex items-center gap-1.5"
        >
          <span>View Live Portfolio</span>
          <span>&rarr;</span>
        </a>
      </div>

      {/* Superadmin Management Banner */}
      {isSuperadmin && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/10 to-transparent border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
              <span>👑</span> Platform Superadmin Control
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Multi-Tenant Portfolio & User Management
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl">
              You have superadmin rights to generate accounts, issue login credentials, reset passwords, and oversee all portfolios on this platform.
            </p>
          </div>

          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>Manage User Accounts</span>
            <span>&rarr;</span>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Link
            key={idx}
            to={stat.link}
            className={`bg-white dark:bg-[#111111] border rounded-xl p-6 shadow-sm transition-all hover:border-cyan-accent/50 block group ${
              stat.isAlert
                ? 'border-cyan-accent/40 ring-1 ring-cyan-accent/20'
                : 'border-gray-200 dark:border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-accent/10 flex items-center justify-center text-cyan-accent group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
              <span className="text-xs text-cyan-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View &rarr;
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-500 mt-1 transition-colors">{stat.title}</p>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Projects List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Recently Updated Projects</h3>
            <Link to="/admin/projects" className="text-sm text-cyan-accent hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {stats?.recentProjects?.length > 0 ? (
              stats.recentProjects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-900 rounded flex items-center justify-center text-gray-500 text-xs overflow-hidden">
                      {project.imageUrl ? <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" /> : 'IMG'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm transition-colors">{project.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 transition-colors">Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Link to={`/admin/projects/${project.id}`} className="px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded transition-colors">
                    Edit
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm py-4">No projects added yet.</p>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
          
          <div className="flex flex-col gap-3">
            <Link 
              to="/admin/projects/new"
              className="w-full py-3 px-4 bg-cyan-accent text-black font-semibold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-cyan-accent/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Project
            </Link>

            <Link 
              to="/admin/experience/new"
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Experience
            </Link>

            {isSuperadmin && (
              <Link 
                to="/admin/users"
                className="w-full py-3 px-4 bg-purple-600/10 border border-purple-500/30 text-purple-400 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white transition-colors"
              >
                <span>👑</span>
                <span>Create User Credentials</span>
              </Link>
            )}

            <Link 
              to="/admin/profile"
              className="w-full py-3 px-4 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm flex items-center justify-center gap-2 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
