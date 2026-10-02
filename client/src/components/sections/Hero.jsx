import { useEffect, useState } from 'react';
import { fetchProfile } from '../../utils/api';

export default function Hero({ settings, onOpenRecruiterView, profileData }) {
  const [profile, setProfile] = useState(profileData || null);
  const [loading, setLoading] = useState(!profileData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setLoading(false);
      return;
    }
    fetchProfile()
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load profile');
        setLoading(false);
      });
  }, [profileData]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-cyan-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  const resumeHref = settings?.resumeUrl || profile?.resumeUrl || "/resume.pdf";

  return (
    <section id="about" className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Ambient background glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-cyan-accent/10 dark:bg-cyan-accent/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-sky-accent/10 dark:bg-sky-accent/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* Left Content (Span 7) */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6 sm:space-y-7">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-cyan-accent/10 border border-cyan-accent/25 shadow-xs">
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-accent uppercase">
                {profile?.tagline || "Full-Stack & Systems Engineer"}
              </span>
            </div>

            {settings?.isAvailableForHire && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{settings?.availabilityStatus || "Available for Opportunities"}</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Hi, I'm <span className="text-cyan-accent">{profile?.name ? profile.name.split(' ')[0] : 'Kartik'}</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-accent via-sky-500 to-blue-600">
              {profile?.name && profile.name.split(' ').length > 1 ? profile.name.split(' ').slice(1).join(' ') : (profile?.name ? '' : 'Bhadane.')}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            {profile?.bio || "I build high-performance software products, full-stack web platforms, mobile architectures, and resilient developer systems."}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
            <a 
              href="#projects" 
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold bg-cyan-accent hover:bg-cyan-accent/90 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>Explore Featured Work</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>

            <a 
              href={resumeHref} 
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download CV</span>
            </a>
          </div>

          {/* Recruiter 30-Sec Quick Link */}
          <button
            onClick={onOpenRecruiterView}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-accent hover:underline pt-1 cursor-pointer group"
          >
            <span>Hiring? View the 30-Second Recruiter Summary</span>
            <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
          </button>
        </div>

        {/* Right Content / Portrait Showcase (Span 5) */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl group">
             
             {/* Tech Badge Chips */}
             <div className="absolute top-4 right-4 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 z-10">
               <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-cyan-accent" />
                 SWE Portfolio
               </span>
             </div>
             
             <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 z-10 flex items-center gap-2 shadow-lg">
               <div className="w-2 h-2 rounded-full bg-cyan-accent animate-ping" />
               <span className="text-xs font-mono font-bold text-white">READY.FOR.HIRE</span>
             </div>
             
             {profile?.photoUrl ? (
               <img 
                 src={profile.photoUrl} 
                 alt={profile?.name || "Kartik Bhadane"} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
               />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-slate-200 via-slate-100 to-cyan-50 dark:from-[#0F172A] dark:via-[#131D31] dark:to-[#1E293B] flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-20 h-20 rounded-2xl bg-cyan-accent/20 border border-cyan-accent/40 flex items-center justify-center text-cyan-accent font-black text-3xl mb-3 shadow-inner">
                   {profile?.name ? profile.name[0] : 'K'}
                 </div>
                 <h4 className="font-bold text-slate-800 dark:text-white text-base">
                   {profile?.name || "Kartik Bhadane"}
                 </h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                   Full-Stack Engineer &amp; Systems Architect
                 </p>
               </div>
             )}
          </div>
        </div>

      </div>
    </section>
  );
}
