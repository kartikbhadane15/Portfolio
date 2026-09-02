import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAdminProject, updateAdminProject, fetchAdminProjects, uploadFile } from '../../utils/api';

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    projectType: '',
    description: '',
    imageUrl: '',
    demoUrl: '',
    githubUrl: '',
    tags: '', // We'll split this by comma for the API
    startDate: '',
    endDate: '',
    isFeatured: false,
    featuredOrder: 0,
    screenshots: [],
    websiteUrl: '',
    showCaseStudy: false,
    cs_overview: '',
    cs_problemStatement: '',
    cs_objectives: '',
    cs_background: '',
    cs_methodology: '',
    cs_tools: '',
    cs_implementation: '',
    cs_challenges: '',
    cs_solutions: '',
    cs_results: '',
    cs_conclusion: '',
    cs_futureScope: ''
  });
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const projects = await fetchAdminProjects();
      const project = projects.find(p => p.id === id);
      if (project) {
        setFormData({
          title: project.title || '',
          projectType: project.projectType || '',
          description: project.description || '',
          imageUrl: project.imageUrl || '',
          demoUrl: project.liveUrl || '',
          githubUrl: project.githubUrl || '',
          tags: project.tags ? project.tags.join(', ') : '',
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
          isFeatured: project.isFeatured || false,
          featuredOrder: project.featuredOrder || 0,
          screenshots: project.screenshots || [],
          websiteUrl: project.websiteUrl || '',
          showCaseStudy: !!project.caseStudy,
          cs_overview: project.caseStudy?.overview || '',
          cs_problemStatement: project.caseStudy?.problemStatement || '',
          cs_objectives: project.caseStudy?.objectives || '',
          cs_background: project.caseStudy?.background || '',
          cs_methodology: project.caseStudy?.methodology || '',
          cs_tools: project.caseStudy?.tools || '',
          cs_implementation: project.caseStudy?.implementation || '',
          cs_challenges: project.caseStudy?.challenges || '',
          cs_solutions: project.caseStudy?.solutions || '',
          cs_results: project.caseStudy?.results || '',
          cs_conclusion: project.caseStudy?.conclusion || '',
          cs_futureScope: project.caseStudy?.futureScope || '',
        });
      }
    } catch (error) {
      console.error('Failed to load project', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await uploadFile(data);
      setFormData(prev => ({ ...prev, [fieldName]: res.url }));
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleScreenshotChange = (idx, value) => {
    const updated = [...formData.screenshots];
    updated[idx] = value;
    setFormData(prev => ({ ...prev, screenshots: updated }));
  };

  const removeScreenshot = (idx) => {
    const updated = formData.screenshots.filter((_, i) => i !== idx);
    setFormData(prev => ({ ...prev, screenshots: updated }));
  };

  const addScreenshotField = () => {
    setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, ''] }));
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await uploadFile(data);
      setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, res.url] }));
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data
    const submitData = {
      title: formData.title,
      projectType: formData.projectType,
      description: formData.description,
      imageUrl: formData.imageUrl,
      demoUrl: formData.demoUrl,
      githubUrl: formData.githubUrl,
      websiteUrl: formData.websiteUrl,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      isFeatured: formData.isFeatured,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      screenshots: formData.screenshots.filter(Boolean),
      featuredOrder: Number(formData.featuredOrder),
      caseStudy: formData.showCaseStudy ? {
        overview: formData.cs_overview,
        problemStatement: formData.cs_problemStatement,
        objectives: formData.cs_objectives,
        background: formData.cs_background,
        methodology: formData.cs_methodology,
        tools: formData.cs_tools,
        implementation: formData.cs_implementation,
        challenges: formData.cs_challenges,
        solutions: formData.cs_solutions,
        results: formData.cs_results,
        conclusion: formData.cs_conclusion,
        futureScope: formData.cs_futureScope
      } : null
    };

    try {
      if (isEditing) {
        await updateAdminProject(id, submitData);
      } else {
        await createAdminProject(submitData);
      }
      navigate('/admin/projects');
    } catch (error) {
      console.error('Failed to save project', error);
      alert('Failed to save project');
    }
  };

  if (loading) return <div className="text-gray-400">Loading project data...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/projects')} className="text-gray-400 hover:text-white">
          &larr; Back
        </button>
        <h2 className="text-2xl font-bold text-white">
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </h2>
      </div>

      <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Project Title *</label>
              <input 
                type="text" 
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Project Type</label>
              <input 
                type="text" 
                name="projectType"
                placeholder="e.g. Web App, Library, Full Stack"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Start Date</label>
              <input 
                type="date" 
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white">End Date</label>
                <span className="text-xs text-gray-400">Leave empty if Ongoing</span>
              </div>
              <input 
                type="date" 
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none"
              />
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
              className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white">Main Image URL</label>
            <div className="flex gap-2">
              <input 
                type="url" 
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={handleChange}
                className="flex-1 bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none"
              />
              <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center">
                Upload
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'imageUrl')}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white">Sub Photos (Screenshots)</label>
            {formData.screenshots.map((shot, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={shot}
                  onChange={(e) => handleScreenshotChange(idx, e.target.value)}
                  placeholder="https://example.com/screenshot.jpg"
                  className="flex-1 bg-black border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent"
                />
                <button type="button" onClick={() => removeScreenshot(idx)} className="bg-red-900/30 hover:bg-red-900 text-red-500 px-3 rounded-lg transition-colors">X</button>
              </div>
            ))}
            <div className="flex gap-6 mt-2">
              <button type="button" onClick={addScreenshotField} className="text-sm text-cyan-accent hover:underline font-medium">
                + Add URL manually
              </button>
              <label className="text-sm text-cyan-accent hover:underline font-medium cursor-pointer">
                + Upload Photo
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Demo URL</label>
              <input 
                type="url" 
                name="demoUrl"
                value={formData.demoUrl}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">GitHub URL</label>
              <input 
                type="url" 
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Website URL</label>
              <input 
                type="url" 
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white">Tags (comma separated)</label>
            <input 
              type="text" 
              name="tags"
              placeholder="React, Node.js, Tailwind"
              value={formData.tags}
              onChange={handleChange}
              className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-black border-gray-800 text-cyan-accent focus:ring-cyan-accent"
              />
              <label htmlFor="isFeatured" className="text-sm text-gray-300 font-medium">
                Feature this project on the home page
              </label>
            </div>
            
            {formData.isFeatured && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-white">Priority Order:</label>
                <input 
                  type="number" 
                  name="featuredOrder"
                  value={formData.featuredOrder}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  className="w-20 bg-black border border-gray-800 rounded-lg px-3 py-1 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none"
                />
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Project Case Study</h3>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    name="showCaseStudy"
                    className="sr-only"
                    checked={formData.showCaseStudy}
                    onChange={handleChange}
                  />
                  <div className={`block w-14 h-8 rounded-full ${formData.showCaseStudy ? 'bg-cyan-accent' : 'bg-gray-700'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${formData.showCaseStudy ? 'translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-300 font-medium">Include Detailed Case Study</div>
              </label>
            </div>
            
            {formData.showCaseStudy && (
              <div className="space-y-6 mt-6 bg-black p-6 rounded-xl border border-gray-800">
                {[
                  { id: 'cs_overview', label: 'Project Overview', placeholder: 'What the project is about.' },
                  { id: 'cs_problemStatement', label: 'Problem Statement', placeholder: 'The problem or need you wanted to solve.' },
                  { id: 'cs_objectives', label: 'Objectives', placeholder: 'What the project aimed to achieve.' },
                  { id: 'cs_background', label: 'Background/Context', placeholder: 'Why the project was needed and the relevant situation.' },
                  { id: 'cs_methodology', label: 'Methodology/Approach', placeholder: 'How you worked on the project.' },
                  { id: 'cs_tools', label: 'Tools & Technologies', placeholder: 'Software, technologies, or methods used.' },
                  { id: 'cs_implementation', label: 'Implementation', placeholder: 'What you actually did.' },
                  { id: 'cs_challenges', label: 'Challenges', placeholder: 'Problems faced during the project.' },
                  { id: 'cs_solutions', label: 'Solutions', placeholder: 'How you solved those problems.' },
                  { id: 'cs_results', label: 'Results/Outcomes', placeholder: 'What you achieved, preferably with data or measurable results.' },
                  { id: 'cs_conclusion', label: 'Conclusion', placeholder: 'Main takeaways from the project.' },
                  { id: 'cs_futureScope', label: 'Future Scope', placeholder: 'Possible improvements or next steps.' },
                ].map(field => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-sm font-bold text-gray-300">{field.label}</label>
                    <textarea 
                      name={field.id}
                      rows="3"
                      placeholder={field.placeholder}
                      value={formData[field.id]}
                      onChange={handleChange}
                      className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent outline-none resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-800 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/admin/projects')}
              className="px-6 py-2 text-gray-400 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-cyan-accent text-black font-bold rounded-lg hover:bg-cyan-accent/90"
            >
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
