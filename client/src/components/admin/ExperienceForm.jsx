import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAdminExperience, updateAdminExperience, fetchAdminExperience } from '../../utils/api';

export default function ExperienceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    role: '',
    company: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    skills: '',
  });
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      loadExperience();
    }
  }, [id]);

  const loadExperience = async () => {
    try {
      const allExp = await fetchAdminExperience();
      const exp = allExp.find(e => e.id === id);
      if (exp) {
        setFormData({
          role: exp.role || '',
          company: exp.company || '',
          location: exp.location || '',
          description: exp.description || '',
          // Format for input type="date"
          startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
          endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
          skills: exp.skills ? exp.skills.join(', ') : '',
        });
      }
    } catch (error) {
      console.error('Failed to load experience', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data
    const submitData = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    try {
      if (isEditing) {
        await updateAdminExperience(id, submitData);
      } else {
        await createAdminExperience(submitData);
      }
      navigate('/admin/experience');
    } catch (error) {
      console.error('Failed to save experience', error);
      alert('Failed to save experience');
    }
  };

  if (loading) return <div className="text-gray-400">Loading experience data...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/experience')} className="text-gray-400 hover:text-white">
          &larr; Back
        </button>
        <h2 className="text-2xl font-bold text-white">
          {isEditing ? 'Edit Experience' : 'Add Experience'}
        </h2>
      </div>

      <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Role / Job Title *</label>
              <input 
                type="text" 
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Company *</label>
              <input 
                type="text" 
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Location</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Remote, New York, NY"
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Skills</label>
              <input 
                type="text" 
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, AWS (comma separated)"
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Start Date *</label>
              <input 
                type="date" 
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">End Date</label>
              <input 
                type="date" 
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
              <p className="text-xs text-gray-500">Leave blank if this is your current role.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white">Description *</label>
            <textarea 
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
            />
          </div>

          <div className="pt-6 border-t border-gray-800 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/admin/experience')}
              className="px-6 py-2 text-gray-400 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600"
            >
              {isEditing ? 'Save Changes' : 'Add Experience'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
