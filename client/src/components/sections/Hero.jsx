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

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  const resumeHref = settings?.resumeUrl || profile?.resumeUrl || "/resume.pdf";

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="flex flex-col items-start space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-accent/10 border border-cyan-accent/20">
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-accent uppercase">
                {profile?.tagline || "Computer Science Engineering Student"}
              </span>
            </div>

            {settings?.isAvailableForHire && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Available for Opportunities</span>
              </div>
            )}
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Hi, I'm <span className="text-cyan-accent">{profile?.name ? profile.name.split(' ')[0] : 'Kartik'}</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-accent to-purple-accent">{profile?.name ? profile.name.split(' ').slice(1).join(' ') : 'Bhadane.'}</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-lg">
            {profile?.bio || "I build practical software products with a focus on mobile, full-stack development, and engineering systems."}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <a 
              href="#projects" 
              className="px-6 py-3 rounded-xl font-bold bg-cyan-accent text-black hover:bg-cyan-accent/90 transition-colors flex items-center gap-2"
            >
              View My Work
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a 
              href={resumeHref} 
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl font-bold border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Resume
            </a>
          </div>

          {/* Recruiter TL;DR quick link */}
          <button
            onClick={onOpenRecruiterView}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-accent hover:underline pt-0.5 cursor-pointer group"
          >
            <span>Short on time? View 30-Second Recruiter Summary</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>
        </div>

        {/* Right Content / Image (Placeholder for now) */}
        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-gray-200 dark:bg-dark-card rounded-3xl overflow-hidden border border-gray-300 dark:border-gray-800 shadow-2xl">
           <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-md border border-white/10 z-10">
             <span className="text-xs font-mono text-white">4th Year CSE</span>
           </div>
           
           <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-md border border-white/10 z-10 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-purple-accent"></div>
             <span className="text-xs font-mono text-white">SYSTEM.READY</span>
           </div>
           
           {profile?.photoUrl ? (
             <img src={profile.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
               <span className="text-gray-500 dark:text-gray-600">Portrait Image Placeholder</span>
             </div>
           )}
        </div>

      </div>
    </section>
  );
}
