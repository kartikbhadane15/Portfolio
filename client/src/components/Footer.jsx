export default function Footer({ profileData }) {
  const name = profileData?.name || "Kartik Bhadane";
  const tagline = profileData?.tagline || "Software Developer / Full-Stack Engineer";
  const github = profileData?.githubUrl || "https://github.com/kartikbhadane15";
  const linkedin = profileData?.linkedinUrl || "https://www.linkedin.com/in/kartik-bhadane-b0464229b/";
  const email = profileData?.email || "kartikbhadane004@gmail.com";
  const resume = profileData?.resumeUrl || "/resume.pdf";

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-light-bg dark:bg-dark-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {name}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          {tagline}
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {github && (
            <a href={github} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-600 hover:text-cyan-accent dark:text-gray-400 dark:hover:text-cyan-accent transition-colors">
              GitHub
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-600 hover:text-cyan-accent dark:text-gray-400 dark:hover:text-cyan-accent transition-colors">
              LinkedIn
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="text-sm font-medium text-gray-600 hover:text-cyan-accent dark:text-gray-400 dark:hover:text-cyan-accent transition-colors">
              Email
            </a>
          )}
          {resume && (
            <a href={resume} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-600 hover:text-cyan-accent dark:text-gray-400 dark:hover:text-cyan-accent transition-colors">
              Resume
            </a>
          )}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
          &copy; {new Date().getFullYear()} {name}. Built with React & Tailwind.
        </p>

      </div>
    </footer>
  );
}
