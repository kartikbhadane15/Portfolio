import { useState, useEffect } from 'react';
import {
  fetchProfile,
  fetchProjects,
  fetchExperience,
  fetchSkills,
  fetchEducation,
  fetchCertifications
} from '../utils/api';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function RecruiterModal({ isOpen, onClose, settings, portfolioData, username }) {
  const [profile, setProfile] = useState(portfolioData?.profile || null);
  const [projects, setProjects] = useState(portfolioData?.projects || []);
  const [experience, setExperience] = useState(portfolioData?.experience || []);
  const [skills, setSkills] = useState(portfolioData?.skills || {});
  const [education, setEducation] = useState(portfolioData?.education || []);
  const [certifications, setCertifications] = useState(portfolioData?.certifications || []);
  const [loading, setLoading] = useState(!portfolioData);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (portfolioData) {
      setProfile(portfolioData.profile || null);
      setProjects(portfolioData.projects ? portfolioData.projects.filter(p => p.isFeatured !== false) : []);
      setExperience(portfolioData.experience || []);
      setSkills(portfolioData.skills || {});
      setEducation(portfolioData.education || []);
      setCertifications(portfolioData.certifications || []);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetchPublicPortfolio(username || 'kartik')
      .then((data) => {
        if (data) {
          setProfile(data.profile || null);
          setProjects(data.projects ? data.projects.filter(p => p.isFeatured !== false) : []);
          setExperience(data.experience || []);
          setSkills(data.skills || {});
          setEducation(data.education || []);
          setCertifications(data.certifications || []);
        }
      })
      .catch((err) => {
        console.error('Recruiter modal data loading error:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, portfolioData, username]);

  if (!isOpen) return null;

  const email = profile?.email || '';
  const resumeHref = settings?.resumeUrl || profile?.resumeUrl || '/resume.pdf';
  const linkedinHref = profile?.linkedinUrl || '';
  const githubHref = profile?.githubUrl || '';

  const handleCopyEmail = () => {
    if (email && navigator?.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  // Safe category extraction whether skills is an array or a grouped object
  let skillsByCategory = {};
  if (skills && typeof skills === 'object') {
    if (Array.isArray(skills)) {
      skillsByCategory = skills.reduce((acc, s) => {
        const cat = s?.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s);
        return acc;
      }, {});
    } else {
      skillsByCategory = skills;
    }
  }

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeExperience = Array.isArray(experience) ? experience : [];
  const safeEducation = Array.isArray(education) ? education : [];
  const safeCertifications = Array.isArray(certifications) ? certifications : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* MODAL TOP BAR */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Recruiter Quick View <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20 font-mono">TL;DR</span>
            </h2>
            <p className="text-xs text-gray-400 hidden sm:block">
              30-second executive summary for engineering managers and recruiters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={resumeHref}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-accent text-black text-xs font-bold hover:bg-cyan-accent/90 transition-colors"
            >
              <span>Download CV</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* BODY */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500 font-mono">Loading executive brief...</span>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* 1. CANDIDATE PROFILE CARD */}
            <div className="bg-gray-50 dark:bg-black p-6 rounded-2xl border border-gray-200 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>{settings?.availabilityStatus || "Open to Full-Time SWE Opportunities (2027)"}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  {profile?.name || "Kartik Bhadane"}
                </h1>

                <p className="text-sm font-semibold text-cyan-accent mt-0.5">
                  {profile?.tagline || "Software Engineer • Mobile & Full-Stack Systems"}
                </p>

                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 max-w-xl leading-relaxed">
                  {profile?.bio || "Building robust, scalable applications with React, React Native, Node.js, and modern cloud databases."}
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap sm:flex-col gap-2 min-w-[170px]">
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-cyan-accent text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-accent/90 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Resume (PDF)</span>
                </a>

                <button
                  onClick={handleCopyEmail}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-[#151515] border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:border-cyan-accent hover:text-cyan-accent transition-colors cursor-pointer"
                >
                  <span>{copiedEmail ? '✓ Copied!' : '✉ Copy Email'}</span>
                </button>

                <div className="flex gap-2 w-full">
                  <a
                    href={linkedinHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#151515] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 hover:border-blue-500 hover:text-blue-500 transition-colors"
                  >
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={githubHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#151515] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 2. TECHNICAL SKILLS MATRIX */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                Core Technical Stack
              </h3>
              
              {Object.keys(skillsByCategory).length === 0 ? (
                <div className="flex flex-wrap gap-2">
                  {['React', 'React Native', 'Node.js', 'Express', 'TypeScript', 'JavaScript', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Git', 'REST APIs'].map((s) => (
                    <span key={s} className="px-3 py-1 bg-gray-100 dark:bg-[#181818] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-medium text-gray-800 dark:text-gray-200">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(skillsByCategory).map(([category, items]) => (
                    <div key={category} className="p-3.5 rounded-xl bg-gray-50/60 dark:bg-black/60 border border-gray-200 dark:border-gray-800/80 space-y-2">
                      <span className="text-xs font-bold text-cyan-accent uppercase tracking-wider">{category}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(items) && items.map(s => (
                          <span key={s.id || s.name} className="px-2.5 py-0.5 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-800 rounded-md text-xs text-gray-800 dark:text-gray-200 font-medium">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. TOP FEATURED PROJECTS SNAPSHOT */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                  Top Featured Projects
                </h3>
                <a href="#projects" onClick={onClose} className="text-xs font-semibold text-cyan-accent hover:underline">
                  View all projects &rarr;
                </a>
              </div>

              {safeProjects.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 text-xs text-gray-500 text-center">
                  Full stack and mobile engineering projects in progress.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {safeProjects.slice(0, 2).map((proj) => (
                    <div key={proj.id} className="p-5 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white">
                            {proj.title}
                          </h4>
                          {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20 font-mono">
                              {proj.tags[0]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800/80 text-xs">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(proj.tags) && proj.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="text-[10px] text-gray-500 font-mono">#{t}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          {proj.githubUrl && (
                            <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-cyan-accent font-medium">
                              Code &rarr;
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-cyan-accent font-bold hover:underline">
                              Live &rarr;
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. WORK EXPERIENCE & EDUCATION SNAPSHOT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Experience */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                  Recent Experience
                </h3>
                {safeExperience.length === 0 ? (
                  <div className="text-xs text-gray-500 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 text-center">
                    Independent full-stack developer & engineering project creator.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {safeExperience.slice(0, 2).map((exp) => (
                      <div key={exp.id} className="p-4 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-gray-900 dark:text-white">{exp.role}</span>
                          <span className="text-cyan-accent font-mono text-[11px]">{formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{exp.company}</div>
                        {exp.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education & Certs */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                  Education & Credentials
                </h3>
                {safeEducation.length === 0 ? (
                  <div className="text-xs text-gray-500 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 text-center">
                    Computer Science & Engineering Student
                  </div>
                ) : (
                  <div className="space-y-3">
                    {safeEducation.slice(0, 1).map((edu) => (
                      <div key={edu.id} className="p-4 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800">
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{edu.degree}</div>
                        <div className="text-xs text-cyan-accent font-medium mt-0.5">{edu.fieldOfStudy}</div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span>{edu.institution}</span>
                          <span className="font-mono text-[11px]">{formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : 'Present'}</span>
                        </div>
                      </div>
                    ))}

                    {safeCertifications.slice(0, 2).map((cert) => (
                      <div key={cert.id} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{cert.name}</div>
                          <div className="text-[11px] text-gray-500">{cert.issuer}</div>
                        </div>
                        {cert.url && (
                          <a href={cert.url} target="_blank" rel="noreferrer" className="text-cyan-accent font-bold hover:underline">
                            Verify &rarr;
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* 5. FOOTER CALL TO ACTION */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 text-center sm:text-left">
                Want to see the deep dive? Close this view to explore full interactive project case studies and code breakdown.
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 text-xs font-bold hover:border-cyan-accent hover:text-cyan-accent transition-colors cursor-pointer"
                >
                  Close & Return to Full Portfolio
                </button>

                <a
                  href={`mailto:${email}`}
                  className="px-5 py-2.5 rounded-xl bg-cyan-accent text-black text-xs font-bold hover:bg-cyan-accent/90 transition-colors shadow-xs"
                >
                  Send Email &rarr;
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
