import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Experience from '../components/sections/Experience';
import { fetchPublicPortfolio } from '../utils/api';
import PortfolioInactive from '../components/PortfolioInactive';

export default function ExperiencePage() {
  const { username: routeUsername } = useParams();
  const username = routeUsername || 'kartik';
  const [experienceData, setExperienceData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [inactiveInfo, setInactiveInfo] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetchPublicPortfolio(username)
      .then((data) => {
        if (data) {
          setProfile(data.profile);
          setExperienceData(data.experience || []);
          if (data.profile?.name) {
            document.title = `${data.profile.name} | Experience`;
          }
          if (data.settings?.accentColor) {
            document.documentElement.style.setProperty('--accent-color', data.settings.accentColor);
            document.documentElement.style.setProperty('--color-cyan-accent', data.settings.accentColor);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load user experience:', err);
        if (err.response?.status === 403 || err.response?.data?.isInactive) {
          setInactiveInfo(err.response?.data || { isBlocked: true, message: 'Portfolio unavailable' });
        }
      });
  }, [username]);

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

  return (
    <div className="bg-white dark:bg-[#050505] transition-colors duration-300 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mb-4">
        <Link to={`/${username}`} className="text-gray-500 hover:text-cyan-accent flex items-center gap-2 font-medium w-fit">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {profile?.name ? `${profile.name}'s Portfolio` : 'Portfolio'}
        </Link>
      </div>
      <Experience showAll={true} experienceData={experienceData} />
    </div>
  );
}
