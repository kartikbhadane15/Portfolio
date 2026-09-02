import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminProjects, deleteAdminProject } from '../../utils/api';
import { formatProjectDuration } from '../../utils/dateFormatter';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchAdminProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteAdminProject(id);
        loadProjects(); // Reload the list
      } catch (error) {
        console.error('Failed to delete project', error);
      }
    }
  };

  if (loading) return <div className="text-gray-400">Loading projects...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Manage Projects</h2>
        <Link 
          to="/admin/projects/new" 
          className="px-4 py-2 bg-cyan-accent text-black font-bold rounded hover:bg-cyan-accent/90 transition-colors"
        >
          + Add Project
        </Link>
      </div>

      <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Title</th>
              <th className="px-6 py-4 font-semibold">Visibility</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{project.title}</div>
                  {formatProjectDuration(project.startDate, project.endDate) && (
                    <div className="text-xs text-cyan-accent/80 font-mono mt-0.5">
                      📅 {formatProjectDuration(project.startDate, project.endDate)}
                    </div>
                  )}
                  <div className="text-xs truncate max-w-[300px] mt-1 text-gray-500">{project.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${project.isFeatured ? 'bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20' : 'bg-gray-800 text-gray-300'}`}>
                    {project.isFeatured ? `Featured (Priority: ${project.featuredOrder || 0})` : 'Standard'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(project.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link 
                    to={`/admin/projects/${project.id}`} 
                    className="text-cyan-accent hover:underline font-medium"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="text-red-500 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No projects found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
