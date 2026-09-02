import { useState, useEffect } from 'react';
import { fetchEducation, fetchCertifications, fetchAchievements } from '../../utils/api';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function CredentialsSection({ educationData, certificationsData, achievementsData }) {
  const [education, setEducation] = useState(educationData || []);
  const [certifications, setCertifications] = useState(certificationsData || []);
  const [achievements, setAchievements] = useState(achievementsData || []);
  const [loading, setLoading] = useState(!educationData && !certificationsData && !achievementsData);

  // Hidden by default; unhides when user clicks "View Extra Credentials"
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (educationData || certificationsData || achievementsData) {
      setEducation(educationData || []);
      setCertifications(certificationsData || []);
      setAchievements(achievementsData || []);
      setLoading(false);
      return;
    }
    Promise.all([
      fetchEducation().catch(() => []),
      fetchCertifications().catch(() => []),
      fetchAchievements().catch(() => [])
    ]).then(([edu, certs, achs]) => {
      setEducation(edu || []);
      setCertifications(certs || []);
      setAchievements(achs || []);
    }).finally(() => {
      setLoading(false);
    });
  }, [educationData, certificationsData, achievementsData]);

  // If user navigates directly to #credentials, #education, #certifications, or #achievements, expand automatically
  useEffect(() => {
    const checkHash = () => {
      const h = window.location.hash;
      if (h === '#credentials' || h === '#education' || h === '#certifications' || h === '#achievements') {
        setIsExpanded(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const totalCount = education.length + certifications.length + achievements.length;

  return (
    <section id="credentials" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-300">
      
      {/* 1. COLLAPSED VIEW (DEFAULT) */}
      {!isExpanded ? (
        <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:from-[#0d0d0d] dark:via-[#141414] dark:to-[#0d0d0d] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 sm:p-12 text-center shadow-md relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-cyan-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            
            {/* Badges preview */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20">
                <span>🎓</span> {education.length} Education
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20">
                <span>📜</span> {certifications.length} Certifications
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20">
                <span>🏆</span> {achievements.length} Achievements
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Education, Certifications & Achievements
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                Discover my academic background, verified industry licenses, and honors achieved along my engineering journey.
              </p>
            </div>

            {/* View Extra Credentials Button */}
            <div className="pt-2">
              <button
                onClick={toggleExpand}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-cyan-accent text-black font-bold text-base hover:bg-cyan-accent/90 transition-all shadow-[0_0_25px_rgba(0,229,255,0.25)] hover:shadow-[0_0_35px_rgba(0,229,255,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>View Extra Credentials</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* 2. UNHIDDEN / EXPANDED FULL VIEW */
        <div className="space-y-20 animate-in fade-in-0 duration-300">
          
          {/* Top banner when expanded: shows title and "Hide" toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20 mb-2">
                <span>✨</span> Verified Credentials & Background
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Credentials & Background
              </h2>
            </div>

            <button
              onClick={toggleExpand}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:text-cyan-accent dark:hover:text-cyan-accent hover:border-cyan-accent text-sm font-semibold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <span>Hide Credentials</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          {/* SUB-SECTION 1: EDUCATION */}
          <div id="education" className="space-y-8 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20 mb-3">
                  <span>🎓</span> Academic Journey
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Education
                </h3>
              </div>
              <p className="text-sm text-gray-500 max-w-md">
                Formal foundations and academic training in computer science and engineering.
              </p>
            </div>

            {education.length === 0 ? (
              <div className="bg-white/50 dark:bg-dark-card/50 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-sm">
                Education records will appear here as soon as they are added in the admin panel.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800/80 hover:border-cyan-accent/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                          {edu.degree}
                        </h4>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20 whitespace-nowrap">
                          {formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                        </span>
                      </div>

                      {edu.fieldOfStudy && (
                        <p className="text-sm font-semibold text-cyan-accent mb-2">
                          {edu.fieldOfStudy}
                        </p>
                      )}

                      <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
                        {edu.institution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800"></div>

          {/* SUB-SECTION 2: CERTIFICATIONS */}
          <div id="certifications" className="space-y-8 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20 mb-3">
                  <span>📜</span> Verified Credentials
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Certifications & Licenses
                </h3>
              </div>
              <p className="text-sm text-gray-500 max-w-md">
                Industry recognized certifications and specialized technical credentials.
              </p>
            </div>

            {certifications.length === 0 ? (
              <div className="bg-white/50 dark:bg-dark-card/50 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-sm">
                Certifications will appear here once added in the admin panel.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800/80 hover:border-cyan-accent/40 transition-all shadow-sm flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-accent/10 text-cyan-accent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-cyan-accent transition-colors">
                        {cert.name}
                      </h4>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-3">
                        {cert.issuer}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        Issued {formatDate(cert.date)}
                      </span>
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-cyan-accent hover:underline flex items-center gap-1"
                        >
                          Verify &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800"></div>

          {/* SUB-SECTION 3: ACHIEVEMENTS */}
          <div id="achievements" className="space-y-8 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20 mb-3">
                  <span>🏆</span> Recognitions & Milestones
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Achievements
                </h3>
              </div>
              <p className="text-sm text-gray-500 max-w-md">
                Hackathons, awards, and milestones achieved along the engineering journey.
              </p>
            </div>

            {achievements.length === 0 ? (
              <div className="bg-white/50 dark:bg-dark-card/50 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-sm">
                Achievements will appear here once added in the admin panel.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="bg-white dark:bg-dark-card p-6 sm:p-7 rounded-2xl border border-gray-200 dark:border-gray-800/80 hover:border-cyan-accent/40 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          {ach.title}
                        </h4>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20 whitespace-nowrap">
                          {formatDate(ach.date)}
                        </span>
                      </div>

                      {ach.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-2 whitespace-pre-wrap">
                          {ach.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom collapse button */}
          <div className="text-center pt-6">
            <button
              onClick={() => {
                toggleExpand();
                const el = document.getElementById('credentials');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:text-cyan-accent dark:hover:text-cyan-accent hover:border-cyan-accent text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
              <span>Collapse Credentials</span>
            </button>
          </div>

        </div>
      )}

    </section>
  );
}
