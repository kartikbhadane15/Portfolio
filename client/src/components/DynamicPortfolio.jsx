import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicPortfolio } from '../utils/api';

import Navbar from './Navbar';
import Footer from './Footer';
import Hero from './sections/Hero';
import Experience from './sections/Experience';
import FeaturedProjects from './sections/FeaturedProjects';
import TechnicalArsenal from './sections/TechnicalArsenal';
import HowIBuild from './sections/HowIBuild';
import CredentialsSection from './sections/CredentialsSection';
import Contact from './sections/Contact';
import RecruiterModal from './RecruiterModal';

import PortfolioInactive from './PortfolioInactive';

export default function DynamicPortfolio({ defaultUsername = null }) {
  const { username: routeUsername } = useParams();
  const username = routeUsername || defaultUsername;

  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [inactiveInfo, setInactiveInfo] = useState(null);
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setInactiveInfo(null);

    fetchPublicPortfolio(username)
      .then((data) => {
        setPortfolioData(data);

        // Apply dynamic accent color
        if (data?.settings?.accentColor) {
          document.documentElement.style.setProperty('--accent-color', data.settings.accentColor);
          document.documentElement.style.setProperty('--color-cyan-accent', data.settings.accentColor);
        }

        // Apply site title
        if (data?.settings?.siteTitle) {
          document.title = data.settings.siteTitle;
        } else if (data?.profile?.name) {
          document.title = `${data.profile.name} | Portfolio`;
        }

        // Apply default theme if needed
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme && data?.settings?.defaultTheme) {
          if (data.settings.defaultTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load portfolio:', err);
        if (err.response?.status === 403 || err.response?.data?.isInactive) {
          setInactiveInfo(err.response?.data || { isBlocked: true, message: 'Portfolio is unavailable' });
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="w-10 h-10 border-2 border-cyan-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-gray-500">Loading portfolio for @{username}...</p>
      </div>
    );
  }

  // If user is blocked or expired (and viewer is not superadmin)
  if (inactiveInfo) {
    return (
      <PortfolioInactive
        username={username}
        isBlocked={inactiveInfo.isBlocked}
        isExpired={inactiveInfo.isExpired}
        message={inactiveInfo.message}
      />
    );
  }

  if (notFound || !portfolioData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-light-bg dark:bg-dark-bg text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          Portfolio Not Found
        </h1>
        <p className="text-sm text-gray-500 max-w-md mb-8">
          The portfolio for user <span className="font-mono text-cyan-accent font-bold">@{username}</span> does not exist or has not been configured yet.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
        >
          &larr; Return to Home Portfolio
        </Link>
      </div>
    );
  }

  const { profile, projects, experience, skills, education, certifications, achievements, settings, adminPreview } = portfolioData;

  const showExp = settings?.showExperience !== false;
  const showProj = settings?.showProjects !== false;
  const showSkills = settings?.showSkills !== false;
  const showCreds = settings?.showCredentials !== false;
  const showContact = settings?.showContact !== false;

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white">
      
      {/* SUPERADMIN PREVIEW BANNER */}
      {adminPreview && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs sticky top-0 z-[60] backdrop-blur-md shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white text-2xs uppercase tracking-wider font-mono">
                👑 Superadmin Preview Mode
              </span>
              <span>
                This portfolio is currently{' '}
                <strong className="underline underline-offset-2">
                  {adminPreview.isBlocked ? 'Blocked by Superadmin' : 'Subscription Expired'}
                </strong>{' '}
                and completely hidden from the public. Only you can view this.
              </span>
            </div>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 hover:underline shrink-0"
            >
              <span>Manage User & Subscription</span> &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <Navbar
        profileName={profile?.name}
        username={username}
        onOpenRecruiterView={() => setIsRecruiterModalOpen(true)}
      />

      {/* MAIN CONTENT */}
      <main className="flex-grow pt-20">
        <div className="w-full">
          <Hero
            settings={settings}
            profileData={profile}
            onOpenRecruiterView={() => setIsRecruiterModalOpen(true)}
          />

          {showExp && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800" />
              <Experience experienceData={experience} username={username} />
            </>
          )}

          {showProj && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800" />
              <FeaturedProjects projectsData={projects} username={username} />
            </>
          )}

          {showSkills && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800" />
              <TechnicalArsenal skillsData={skills} />
              <HowIBuild />
            </>
          )}

          {showCreds && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800" />
              <CredentialsSection
                educationData={education}
                certificationsData={certifications}
                achievementsData={achievements}
              />
            </>
          )}

          {showContact && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800" />
              <Contact
                settings={settings}
                profileData={profile}
                username={username}
              />
            </>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <Footer profileData={profile} />

      {/* RECRUITER QUICK VIEW MODAL */}
      <RecruiterModal
        isOpen={isRecruiterModalOpen}
        onClose={() => setIsRecruiterModalOpen(false)}
        settings={settings}
        portfolioData={portfolioData}
        username={username}
      />
    </div>
  );
}
