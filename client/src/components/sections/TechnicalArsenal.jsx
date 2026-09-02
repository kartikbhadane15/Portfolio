import { useEffect, useState } from 'react';
import { fetchSkills } from '../../utils/api';

export default function TechnicalArsenal({ skillsData }) {
  const [groupedSkills, setGroupedSkills] = useState(skillsData || {});
  const [loading, setLoading] = useState(!skillsData);

  useEffect(() => {
    if (skillsData) {
      setGroupedSkills(skillsData);
      setLoading(false);
      return;
    }
    fetchSkills().then(data => {
      setGroupedSkills(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [skillsData]);

  return (
    <section id="skills" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Technical Arsenal</h2>
        <p className="text-gray-600 dark:text-gray-400">Languages, frameworks, and tools I use to build software.</p>
      </div>

      {loading ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 dark:bg-dark-card rounded-2xl"></div>)}
        </div>
      ) : Object.keys(groupedSkills).length === 0 ? (
        <p className="text-gray-500">No skills added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="p-8 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{category}</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map(skill => (
                  <span 
                    key={skill.id} 
                    className="px-4 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
