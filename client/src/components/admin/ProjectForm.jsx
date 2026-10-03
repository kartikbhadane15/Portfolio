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
          showCaseStudy: typeof project.showCaseStudy === 'boolean' ? project.showCaseStudy : !!project.caseStudy,
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
      showCaseStudy: formData.showCaseStudy,
      caseStudy: {
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
      }
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/projects')} 
          className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>&larr;</span> Back to Projects
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your showcase details, media, links, and in-depth engineering case study
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Project Title *
              </label>
              <input 
                type="text" 
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Distributed Task Queue"
                className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Project Type
              </label>
              <input 
                type="text" 
                name="projectType"
                placeholder="e.g. Full-Stack App, Mobile, Library"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Start Date
              </label>
              <input 
                type="date" 
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  End Date
                </label>
                <span className="text-[11px] text-slate-400">Leave blank if Ongoing</span>
              </div>
              <input 
                type="date" 
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Short Description / Summary *
            </label>
            <textarea 
              name="description"
              required
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief summary of the architecture, key problem solved, and stack..."
              className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Main Thumbnail Image URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="url" 
                name="imageUrl"
                placeholder="https://example.com/cover.jpg"
                value={formData.imageUrl}
                onChange={handleChange}
                className="flex-1 bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
              />
              <label className="cursor-pointer bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs">
                Upload Image
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Sub Photos / Screenshots
            </label>
            {formData.screenshots.map((shot, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="url"
                  value={shot}
                  onChange={(e) => handleScreenshotChange(idx, e.target.value)}
                  placeholder="https://example.com/screenshot.jpg"
                  className="flex-1 bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
                <button 
                  type="button" 
                  onClick={() => removeScreenshot(idx)} 
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 rounded-xl text-xs font-semibold transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex gap-4 pt-1">
              <button 
                type="button" 
                onClick={addScreenshotField} 
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                + Add Screenshot URL
              </button>
              <label className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Demo URL
              </label>
              <input 
                type="url" 
                name="demoUrl"
                placeholder="https://app.example.com"
                value={formData.demoUrl}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                GitHub Repo
              </label>
              <input 
                type="url" 
                name="githubUrl"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Website / Article
              </label>
              <input 
                type="url" 
                name="websiteUrl"
                placeholder="https://..."
                value={formData.websiteUrl}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Tags / Technologies (comma separated)
            </label>
            <input 
              type="text" 
              name="tags"
              placeholder="React, Node.js, Postgres, Docker"
              value={formData.tags}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 rounded text-slate-900 dark:text-sky-500 accent-slate-900 dark:accent-sky-500"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Feature on home page
              </span>
            </label>
            
            {formData.isFeatured && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Order:</span>
                <input 
                  type="number" 
                  name="featuredOrder"
                  value={formData.featuredOrder}
                  onChange={handleChange}
                  placeholder="1"
                  className="w-20 bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 outline-none"
                />
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Detailed Case Study
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Optional engineering breakdown for recruiters and visitors</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Show in portfolio</span>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="showCaseStudy"
                    className="sr-only"
                    checked={formData.showCaseStudy}
                    onChange={handleChange}
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${formData.showCaseStudy ? 'bg-slate-900 dark:bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ml-0.5 ${formData.showCaseStudy ? 'translate-x-5' : ''}`} />
                  </div>
                </label>
              </div>
            </div>
            
            <div className="text-xs text-sky-600 dark:text-sky-400 mb-2 font-medium">
              Note: All data entered below is securely uploaded and saved in the database, even if you toggle the visibility off.
            </div>

            <div className="space-y-5 mt-4 p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-[#090D16]/80 border border-slate-200 dark:border-slate-800">
              {[
                { id: 'cs_overview', label: 'Project Overview', placeholder: 'What the project is about.' },
                { id: 'cs_problemStatement', label: 'Problem Statement', placeholder: 'The problem or need you wanted to solve.' },
                { id: 'cs_objectives', label: 'Objectives', placeholder: 'What the project aimed to achieve.' },
                { id: 'cs_background', label: 'Background / Context', placeholder: 'Why the project was needed and relevant context.' },
                { id: 'cs_methodology', label: 'Methodology / Approach', placeholder: 'How you engineered the solution.' },
                { id: 'cs_tools', label: 'Tools & Technologies', placeholder: 'Specific libraries, DBs, and tools employed.' },
                { id: 'cs_implementation', label: 'Technical Implementation', placeholder: 'Deep dive into system logic and implementation details.' },
                { id: 'cs_challenges', label: 'Engineering Challenges', placeholder: 'Tough problems faced during development.' },
                { id: 'cs_solutions', label: 'Solutions & Workarounds', placeholder: 'How you overcame these challenges.' },
                { id: 'cs_results', label: 'Results & Impact', placeholder: 'Measurable outcomes, benchmarks, or users served.' },
                { id: 'cs_conclusion', label: 'Conclusion & Learnings', placeholder: 'Key takeaways from this build.' },
                { id: 'cs_futureScope', label: 'Future Scope', placeholder: 'Next iterations, roadmaps, and extensions.' },
              ].map(field => (
                <div key={field.id} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, [field.id]: '' }))}
                      className="text-[10px] sm:text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors uppercase"
                    >
                      Clear Data
                    </button>
                  </div>
                  <textarea 
                    name={field.id}
                    rows="3"
                    placeholder={field.placeholder}
                    value={formData[field.id]}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/admin/projects')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
