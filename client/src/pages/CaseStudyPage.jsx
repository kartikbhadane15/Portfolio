import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProjectBySlug } from '../utils/api';
import { formatProjectDuration } from '../utils/dateFormatter';

export default function CaseStudyPage() {
  const { username: routeUsername, slug } = useParams();
  const username = routeUsername || 'kartik';
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectBySlug(slug)
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Case study not found.');
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading case study...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-4">{error || 'Project not found'}</h2>
        <Link to={`/${username}`} className="text-cyan-accent hover:underline">
          &larr; Back to Portfolio
        </Link>
      </div>
    );
  }

  const { caseStudy } = project;

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-16">
        <Link to={`/${username}`} className="text-gray-400 hover:text-white inline-flex items-center gap-2 mb-8 transition-colors">
          &larr; Back to Portfolio
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {project.projectType && (
            <span className="text-sm font-mono font-bold text-cyan-accent uppercase tracking-wider">
              {project.projectType}
            </span>
          )}
          {formatProjectDuration(project.startDate, project.endDate, project.createdAt) && (
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono text-gray-300 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">
              <svg className="w-3.5 h-3.5 text-cyan-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatProjectDuration(project.startDate, project.endDate, project.createdAt)}
            </span>
          )}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          {project.title}
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
          {project.shortDescription}
        </p>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-8">
            {project.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-transparent border border-gray-300 dark:border-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-6 mt-8">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Source Code
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              Demo
            </a>
          )}
          {project.websiteUrl && (
            <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
              Website
            </a>
          )}
        </div>
      </div>

      {/* Hero Image */}
      {project.imageUrl && (
        <div className="mb-20 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl bg-gray-100 dark:bg-dark-card w-full aspect-video md:aspect-[21/9]">
          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover object-center" />
        </div>
      )}

      {/* Case Study Content */}
      {caseStudy ? (
        <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-cyan">
          {caseStudy.overview && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Project Overview</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.overview}</p>
            </section>
          )}

          {caseStudy.problemStatement && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Problem Statement</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.problemStatement}</p>
            </section>
          )}

          {caseStudy.objectives && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Objectives</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.objectives}</p>
            </section>
          )}

          {caseStudy.background && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Background & Context</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.background}</p>
            </section>
          )}

          {caseStudy.methodology && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Methodology / Approach</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.methodology}</p>
            </section>
          )}

          {caseStudy.tools && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Tools & Technologies</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.tools}</p>
            </section>
          )}

          {caseStudy.implementation && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Implementation</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.implementation}</p>
            </section>
          )}

          {caseStudy.challenges && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Challenges Faced</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.challenges}</p>
            </section>
          )}

          {caseStudy.solutions && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Solutions</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.solutions}</p>
            </section>
          )}

          {caseStudy.results && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Results & Outcomes</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.results}</p>
            </section>
          )}

          {caseStudy.conclusion && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Conclusion</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.conclusion}</p>
            </section>
          )}

          {caseStudy.futureScope && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Future Scope</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{caseStudy.futureScope}</p>
            </section>
          )}
        </article>
      ) : (
        <div className="text-center py-20 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-black">
          <p className="text-gray-500 text-lg">Detailed case study coming soon.</p>
        </div>
      )}
      {/* Screenshots Gallery */}
      {project.screenshots && project.screenshots.length > 0 && (
        <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Project Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {project.screenshots.map((screenshot, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg bg-gray-100 dark:bg-dark-card aspect-video">
                <img src={screenshot} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
