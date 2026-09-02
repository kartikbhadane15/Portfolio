import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../../utils/api';
import { formatProjectDuration } from '../../utils/dateFormatter';

export default function FeaturedProjects({ projectsData, username }) {
  const [projects, setProjects] = useState(projectsData || []);
  const [loading, setLoading] = useState(!projectsData);

  useEffect(() => {
    if (projectsData) {
      setProjects(projectsData.filter(p => p.isFeatured !== false));
      setLoading(false);
      return;
    }
    // Only fetch featured projects for the home page
    fetchProjects(true).then(data => {
      setProjects(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [projectsData]);

  const basePath = username ? `/${username}` : '/kartik';

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Selected Work</h2>
        <p className="text-gray-600 dark:text-gray-400">A few projects where I turned ideas into working software.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-16">
          <div className="h-96 bg-gray-200 dark:bg-dark-card rounded-3xl"></div>
        </div>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">No featured projects found.</p>
      ) : (
        <div className="space-y-16">
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 lg:p-12 hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm`}
            >
              {/* Image Preview */}
              <div className="w-full lg:w-1/2 aspect-video bg-gray-100 dark:bg-[#111111] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center relative group">
                {project.imageUrl ? (
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <span className="text-gray-400 font-mono text-sm">No Preview Available</span>
                )}
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  {project.projectType && (
                    <span className="text-xs font-mono font-bold text-cyan-accent uppercase tracking-wider">
                      {project.projectType}
                    </span>
                  )}
                  {formatProjectDuration(project.startDate, project.endDate, project.createdAt) && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 px-2.5 py-0.5 rounded-full">
                      {formatProjectDuration(project.startDate, project.endDate, project.createdAt)}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {project.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                  {project.shortDescription || project.description}
                </p>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                      Code
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      Live Demo
                    </a>
                  )}
                  {project.websiteUrl && (
                    <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                      Website
                    </a>
                  )}
                  <Link to={`${basePath}/case-study/${project.slug}`} className="text-cyan-accent font-semibold hover:underline flex items-center gap-1">
                    View Details
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-20 flex justify-center">
        <Link to={`${basePath}/projects`} className="px-8 py-3 rounded-full border border-gray-300 dark:border-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-card transition-colors flex items-center gap-2">
          View All Projects
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
