import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminExperience, deleteAdminExperience } from '../../utils/api';

export default function ExperienceList() {
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperience();
  }, []);

  const loadExperience = async () => {
    try {
      const data = await fetchAdminExperience();
      setExperience(data);
    } catch (error) {
      console.error('Failed to load experience', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this experience entry?')) {
      try {
        await deleteAdminExperience(id);
        loadExperience(); // Reload
      } catch (error) {
        console.error('Failed to delete experience', error);
      }
    }
  };

  if (loading) return <div className="text-gray-400">Loading experience...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Manage Experience</h2>
        <Link 
          to="/admin/experience/new" 
          className="px-4 py-2 bg-purple-500 text-white font-bold rounded hover:bg-purple-600 transition-colors"
        >
          + Add Experience
        </Link>
      </div>

      <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Company</th>
              <th className="px-6 py-4 font-semibold">Dates</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {experience.map((exp) => (
              <tr key={exp.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{exp.role}</div>
                </td>
                <td className="px-6 py-4">{exp.company}</td>
                <td className="px-6 py-4">
                  {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link 
                    to={`/admin/experience/${exp.id}`} 
                    className="text-purple-400 hover:underline font-medium"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(exp.id)}
                    className="text-red-500 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {experience.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No experience entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
