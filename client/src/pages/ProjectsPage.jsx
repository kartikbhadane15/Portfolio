import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicPortfolio } from '../utils/api';
import { formatProjectDuration } from '../utils/dateFormatter';

function normalizeCategory(type) {
  if (!type) return 'Web';
  const lower = type.toLowerCase().trim();
  if (lower.includes('ios')) return 'iOS';
  if (lower.includes('full') || lower.includes('stack')) return 'Full Stack';
  if (lower.includes('sys')) return 'Systems';
  if (lower.includes('back')) return 'Backend';
  if (lower.includes('web') || lower.includes('front')) return 'Web';
  return type.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function ProjectsPage() {
  const { username: routeUsername } = useParams();
  const username = routeUsername || 'kartik';

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);

    fetchPublicPortfolio(username)
      .then((data) => {
        if (data) {
          setProfile(data.profile);
          if (data.settings?.accentColor) {
            document.documentElement.style.setProperty('--accent-color', data.settings.accentColor);
            document.documentElement.style.setProperty('--color-cyan-accent', data.settings.accentColor);
          }
          if (data.profile?.name) {
            document.title = `${data.profile.name} | Projects`;
          }

          const rawProjects = Array.isArray(data.projects) ? data.projects : [];
          const formatted = rawProjects.map((item) => {
            const dateYear = item.createdAt ? new Date(item.createdAt).getFullYear().toString() : '2025';
            const duration = formatProjectDuration(item.startDate, item.endDate, item.createdAt);
            return {
              ...item,
              category: normalizeCategory(item.projectType),
              duration: duration || dateYear,
              year: item.year || dateYear,
            };
          });
          setProjects(formatted);
        }
      })
      .catch((err) => {
        console.error('Failed to load user projects:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  // Compute categories for filter pills
  const categories = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Filter projects by active pill
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-300 pb-28 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to={`/${username}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {profile?.name ? `${profile.name}'s Portfolio` : 'Portfolio'}
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Selected Works
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl font-light">
            A comprehensive archive of engineering projects and technical software created by {profile?.name || `@${username}`}.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2.5 mb-12">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#151515] dark:text-gray-400 dark:hover:bg-[#202020] dark:hover:text-gray-200 border border-transparent dark:border-zinc-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-gray-100 dark:bg-zinc-900/60 animate-pulse border border-gray-200 dark:border-zinc-800"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-400 text-base">No projects found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Link
                key={project.id || project.slug}
                to={`/${username}/case-study/${project.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#101010] border border-gray-200/80 dark:border-zinc-800/80 hover:border-gray-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              >
                {/* Visual Thumbnail Area */}
                <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-[#181818] dark:to-[#0d0d0d] overflow-hidden border-b border-gray-100 dark:border-zinc-800/60 flex items-center justify-center">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 gap-2">
                      <svg className="w-10 h-10 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span className="text-xs font-mono font-medium">{project.category}</span>
                    </div>
                  )}

                  {/* Hover Overlay Arrow */}
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm">
                    <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Category & Date Header */}
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-accent font-mono">
                      {project.category || 'PROJECT'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap ml-2 font-mono">
                      {project.duration || project.year || '2025'}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-cyan-accent transition-colors line-clamp-1">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-6 flex-grow">
                    {project.shortDescription || project.description}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-4 mt-auto">
                    <div className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-200 group-hover:text-cyan-accent transition-colors">
                      <span>Explore Case Study</span>
                      <svg
                        className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
