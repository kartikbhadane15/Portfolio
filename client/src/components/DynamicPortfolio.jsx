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

export default function DynamicPortfolio({ defaultUsername = null }) {
  const { username: routeUsername } = useParams();
  const username = routeUsername || defaultUsername;

  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setNotFound(false);

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
        setNotFound(true);
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

  const { profile, projects, experience, skills, education, certifications, achievements, settings } = portfolioData;

  const showExp = settings?.showExperience !== false;
  const showProj = settings?.showProjects !== false;
  const showSkills = settings?.showSkills !== false;
  const showCreds = settings?.showCredentials !== false;
  const showContact = settings?.showContact !== false;

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white">
      
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
