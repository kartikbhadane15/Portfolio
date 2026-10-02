import { useState, useEffect, useMemo } from 'react';
import { fetchAdminSkills, createAdminSkill, updateAdminSkill, deleteAdminSkill } from '../../utils/api';

// Predefined skill categories with colors
const CATEGORY_COLORS = {
  'Frontend': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Backend': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Mobile': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'DevOps': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Database': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'AI / ML': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Tools': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'Other': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
}

function ProficiencyBar({ value }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  const color =
    pct >= 80 ? 'bg-emerald-500' :
    pct >= 60 ? 'bg-sky-500' :
    pct >= 40 ? 'bg-amber-500' :
    'bg-rose-500';
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-7 shrink-0">{pct}%</span>
    </div>
  );
}

export default function SkillsList() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editSkill, setEditSkill] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', proficiency: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await fetchAdminSkills();
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(skills.map(s => s.category || 'Other'))).sort();
    return ['All', ...cats];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (activeCategory === 'All') return skills;
    return skills.filter(s => (s.category || 'Other') === activeCategory);
  }, [skills, activeCategory]);

  // Group by category for display
  const grouped = useMemo(() => {
    const list = activeCategory === 'All' ? skills : filteredSkills;
    return list.reduce((acc, skill) => {
      const cat = skill.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [skills, filteredSkills, activeCategory]);

  const openAdd = () => {
    setEditSkill(null);
    setForm({ name: '', category: '', proficiency: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (skill) => {
    setEditSkill(skill);
    setForm({
      name: skill.name || '',
      category: skill.category || '',
      proficiency: skill.proficiency != null ? String(skill.proficiency) : '',
    });
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditSkill(null);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Skill name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || null,
        proficiency: form.proficiency !== '' ? Number(form.proficiency) : null,
      };
      if (editSkill) {
        await updateAdminSkill(editSkill.id, payload);
      } else {
        await createAdminSkill(payload);
      }
      await loadSkills();
      closeForm();
    } catch (err) {
      console.error(err);
      setError('Failed to save skill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete skill "${name}"?`)) return;
    try {
      await deleteAdminSkill(id);
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete skill', err);
      alert('Failed to delete skill.');
    }
  };

  const PRESET_CATEGORIES = [
    'Frontend', 'Backend', 'Mobile', 'DevOps', 'Database', 'AI / ML', 'Tools', 'Other',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading skills...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Manage Skills</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{skills.length} skill{skills.length !== 1 ? 's' : ''} across {categories.length - 1} categor{categories.length - 1 !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Skill
        </button>
      </div>

      {/* Category Filter Tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1.5 opacity-60">
                  {skills.filter(s => (s.category || 'Other') === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Skills Grouped by Category */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl py-16 flex flex-col items-center gap-4 text-center p-6 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">No skills found. Add your first skill to build your arsenal!</p>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            + Add Skill
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([category, catSkills]) => (
            <div key={category} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              {/* Category Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#090D16] border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(category)}`}>
                    {category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {catSkills.length} skill{catSkills.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Skills Table */}
              <table className="w-full text-sm text-slate-600 dark:text-slate-300">
                <thead className="text-[11px] text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Skill Name</th>
                    <th className="px-5 py-3 text-left hidden sm:table-cell">Proficiency</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {catSkills.map(skill => (
                    <tr key={skill.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="px-5 py-3">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {skill.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        {skill.proficiency != null ? (
                          <ProficiencyBar value={skill.proficiency} />
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => openEdit(skill)}
                            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(skill.id, skill.name)}
                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal Overlay */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {editSkill ? 'Edit Skill' : 'Add New Skill'}
              </h3>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-lg cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-xs text-red-600 dark:text-red-400 font-medium">
                  {error}
                </div>
              )}

              {/* Skill Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Skill Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. React, Python, Docker..."
                  className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Category</label>
                <div className="relative">
                  <input
                    type="text"
                    list="skill-categories"
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    placeholder="Choose or type category..."
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
                  />
                  <datalist id="skill-categories">
                    {PRESET_CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                {/* Quick category pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setForm(p => ({ ...p, category: cat }))}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        form.category === cat
                          ? getCategoryColor(cat) + ' ring-1'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Proficiency */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Proficiency
                  </label>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {form.proficiency !== '' ? `${form.proficiency}%` : '—'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={form.proficiency !== '' ? form.proficiency : 0}
                  onChange={e => setForm(p => ({ ...p, proficiency: e.target.value }))}
                  className="w-full accent-slate-900 dark:accent-sky-500 h-2 rounded-full cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Expert</span>
                </div>
                {form.proficiency !== '' && (
                  <ProficiencyBar value={Number(form.proficiency)} />
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editSkill ? 'Update Skill' : 'Add Skill'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
