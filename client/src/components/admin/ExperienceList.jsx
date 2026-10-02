import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminExperience, deleteAdminExperience } from '../../utils/api';

export default function ExperienceList() {
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperience();
  }, []);

  const loadExperience = async () => {
    try {
      const data = await fetchAdminExperience();
      setExperience(data || []);
    } catch (error) {
      console.error('Failed to load experience', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, role, company) => {
    if (window.confirm(`Are you sure you want to delete "${role}" at ${company}?`)) {
      try {
        await deleteAdminExperience(id);
        loadExperience();
      } catch (error) {
        console.error('Failed to delete experience', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Career Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize your career history, roles, internships, and key accomplishments
          </p>
        </div>

        <Link 
          to="/admin/experience/new" 
          className="self-start sm:self-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
        >
          <span>+ Add Experience</span>
        </Link>
      </div>

      {/* Container */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-[#090D16] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Role &amp; Company</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {experience.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {exp.role}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {exp.company}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {exp.location || 'Remote / Hybrid'}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                    {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} &ndash;{' '}
                    {exp.isCurrent ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Present</span>
                    ) : (
                      exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link 
                      to={`/admin/experience/${exp.id}`} 
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-2xs transition-colors inline-block"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(exp.id, exp.role, exp.company)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
          {experience.map((exp) => (
            <div key={exp.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {exp.role}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {exp.company}
                  </p>
                </div>
                {exp.isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Current
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} &ndash;{' '}
                {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                {exp.location && ` • ${exp.location}`}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Link 
                  to={`/admin/experience/${exp.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => handleDelete(exp.id, exp.role, exp.company)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {experience.length === 0 && (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
            No experience entries found. Add your first role to display on your portfolio.
          </div>
        )}

      </div>
    </div>
  );
}
