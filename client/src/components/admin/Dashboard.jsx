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
        setError('Failed to load dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading dashboard metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">
        <h3 className="font-bold text-base mb-1">Failed to Load Dashboard</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const isSuperadmin = stats?.userRole === 'superadmin';

  const statCards = [
    { 
      title: 'Projects Showcase', 
      subtitle: 'Published & featured projects',
      value: stats?.totalProjects || 0, 
      link: '/admin/projects', 
      color: 'sky',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      title: 'Career Experience', 
      subtitle: 'Work history & positions',
      value: stats?.totalExperience || 0, 
      link: '/admin/experience', 
      color: 'indigo',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      title: 'Technical Arsenal', 
      subtitle: 'Skills & proficiencies',
      value: stats?.totalSkills || 0, 
      link: '/admin/skills', 
      color: 'emerald',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    { 
      title: 'Client Inquiries', 
      subtitle: 'Unread contact messages',
      value: stats?.unreadMessages || 0, 
      link: '/admin/messages', 
      color: 'amber',
      isAlert: (stats?.unreadMessages || 0) > 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, <span className="text-slate-900 dark:text-white">{stats?.username ? `@${stats.username}` : 'Kartik'}</span>
            </h2>
            {isSuperadmin && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Superadmin
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Production Live</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Manage your personal engineering portfolio, update case studies, oversee inquiries, and tailor your brand settings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <a
            href={`/${stats?.username || 'kartik'}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Preview Public Site</span>
            <span>↗</span>
          </a>
          <Link
            to="/admin/settings"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Superadmin Multi-Tenant Banner */}
      {isSuperadmin && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
              Platform User Management
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Multi-Tenant Architecture & User Provisioning
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              As superadmin, manage user credentials, generate customized portfolio sub-domains, and supervise platform accounts.
            </p>
          </div>

          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs flex-shrink-0"
          >
            <span>Manage User Accounts</span>
            <span>&rarr;</span>
          </Link>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => (
          <Link
            key={idx}
            to={stat.link}
            className={`group bg-white dark:bg-[#0F172A] border rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 block ${
              stat.isAlert
                ? 'border-amber-400/50 dark:border-amber-500/40 ring-1 ring-amber-400/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs ${
                stat.color === 'sky' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' :
                stat.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {stat.icon}
              </div>

              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex items-center gap-1">
                <span>Manage</span>
                <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {stat.title}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                {stat.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid: Recent Projects + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Recent Projects List (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recently Updated Projects
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Latest projects configured on your portfolio
                </p>
              </div>
              <Link 
                to="/admin/projects" 
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1"
              >
                <span>View All</span>
                <span>&rarr;</span>
              </Link>
            </div>
            
            <div className="space-y-3">
              {stats?.recentProjects && stats.recentProjects.length > 0 ? (
                stats.recentProjects.map(project => (
                  <div 
                    key={project.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-slate-800/80 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-mono overflow-hidden flex-shrink-0 border border-slate-300 dark:border-slate-700">
                        {project.imageUrl ? (
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {project.title}
                          </h4>
                          {project.isFeatured && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {project.shortDescription || project.description || 'No description provided'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <Link 
                        to={`/admin/projects/${project.id}`} 
                        className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors shadow-2xs"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">No projects added yet.</p>
                  <Link
                    to="/admin/projects/new"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs transition-colors shadow-xs"
                  >
                    + Create First Project
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Dynamic routing enabled for all slugs</span>
            <Link to="/admin/projects/new" className="font-semibold text-sky-600 dark:text-sky-400 hover:underline">
              + New Project
            </Link>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Frequent admin management tasks</p>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <Link 
                to="/admin/projects/new"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Project</span>
              </Link>

              <Link 
                to="/admin/experience/new"
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Add Career Experience</span>
              </Link>

              <Link 
                to="/admin/profile"
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Edit Profile & Bio</span>
              </Link>

              {isSuperadmin && (
                <Link 
                  to="/admin/users"
                  className="w-full py-2.5 px-4 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>User Accounts</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Platform Status */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              System Architecture
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Database Engine</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  PostgreSQL (Supabase)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Multi-Tenancy</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">Active (/:username)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Recruiter Quick View</span>
                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">Enabled (TL;DR)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
