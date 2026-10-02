import { useEffect, useState } from 'react';
import { fetchExperience } from '../../utils/api';
import { Link } from 'react-router-dom';

export default function Experience({ showAll = false, experienceData, username }) {
  const [experience, setExperience] = useState(experienceData || []);
  const [loading, setLoading] = useState(!experienceData);
  const basePath = username ? `/${username}` : '/kartik';

  useEffect(() => {
    if (experienceData) {
      setExperience(experienceData);
      setLoading(false);
      return;
    }
    fetchExperience().then(data => {
      setExperience(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [experienceData]);

  return (
    <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Experience</h2>
        <p className="text-gray-600 dark:text-gray-400">Professional software development roles and internships.</p>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col space-y-8">
          <div className="h-32 bg-gray-200 dark:bg-dark-card rounded-xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-dark-card rounded-xl"></div>
        </div>
      ) : experience.length === 0 ? (
        <p className="text-gray-500">No experience added yet.</p>
      ) : (
        <div className="relative border-l border-gray-200 dark:border-gray-800 ml-3">
          {(showAll ? experience : experience.slice(0, 3)).map((exp, index) => {
            const startDate = new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const endDate = exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');

            return (
              <div key={exp.id} className="mb-12 ml-8 relative group">
                <span className="absolute -left-[41px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-accent ring-8 ring-light-bg dark:ring-dark-bg"></span>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{exp.role}</h3>
                  <div className="mt-2 sm:mt-0 px-3 py-1 bg-gray-100 dark:bg-dark-card text-xs font-mono text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-800 w-fit">
                    {startDate} - {endDate}
                  </div>
                </div>
                
                <div className="text-cyan-accent font-medium mb-4">
                  {exp.company} <span className="text-gray-400 font-normal text-sm ml-2">{exp.location && `(${exp.location})`}</span>
                </div>
                
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mb-6">
                  {(() => {
                    const lines = exp.description ? exp.description.split('\n') : [];
                    const paragraphs = [];
                    const bullets = [];

                    lines.forEach(line => {
                      const trimmed = line.trim();
                      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
                        bullets.push(trimmed.substring(2).trim());
                      } else if (trimmed !== '') {
                        paragraphs.push(trimmed);
                      }
                    });

                    return (
                      <div className="space-y-4">
                        {paragraphs.length > 0 && (
                          <div className="whitespace-pre-line">
                            {paragraphs.join('\n')}
                          </div>
                        )}
                        {bullets.length > 0 && (
                          <ul className="space-y-3 mt-4 pl-1">
                            {bullets.map((bullet, i) => (
                              <li key={i} className="flex items-start">
                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-accent mt-2.5 mr-4"></span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })()}
                </div>
                
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exp.skills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 text-xs font-mono bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!showAll && experience.length > 3 && (
        <div className="mt-12 flex justify-center">
          <Link to={`${basePath}/experience`} className="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-card transition-colors flex items-center gap-2">
            View All Experience
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}
