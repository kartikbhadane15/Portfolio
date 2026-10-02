import { useState, useEffect } from 'react';
import {
  fetchAdminEducation, createAdminEducation, updateAdminEducation, deleteAdminEducation,
  fetchAdminCertifications, createAdminCertification, updateAdminCertification, deleteAdminCertification,
  fetchAdminAchievements, createAdminAchievement, updateAdminAchievement, deleteAdminAchievement
} from '../../utils/api';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function toInputDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export default function MoreHub() {
  const [activeTab, setActiveTab] = useState('education'); // 'education' | 'certifications' | 'achievements'

  // Data states
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalType, setModalType] = useState(null); // 'education' | 'certifications' | 'achievements' | null
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, title }
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isPresent: false });
  const [certForm, setCertForm] = useState({ name: '', issuer: '', date: '', url: '' });
  const [achForm, setAchForm] = useState({ title: '', date: '', description: '' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [eduData, certData, achData] = await Promise.all([
        fetchAdminEducation().catch(() => []),
        fetchAdminCertifications().catch(() => []),
        fetchAdminAchievements().catch(() => [])
      ]);
      setEducation(eduData || []);
      setCertifications(certData || []);
      setAchievements(achData || []);
    } catch (err) {
      console.error('Failed to load credentials data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Add Modal
  const openAddModal = (type) => {
    setModalType(type);
    setEditingItem(null);
    setModalError('');
    if (type === 'education') {
      setEduForm({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isPresent: false });
    } else if (type === 'certifications') {
      setCertForm({ name: '', issuer: '', date: '', url: '' });
    } else if (type === 'achievements') {
      setAchForm({ title: '', date: '', description: '' });
    }
  };

  // Open Edit Modal
  const openEditModal = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    setModalError('');
    if (type === 'education') {
      setEduForm({
        institution: item.institution || '',
        degree: item.degree || '',
        fieldOfStudy: item.fieldOfStudy || '',
        startDate: toInputDate(item.startDate),
        endDate: toInputDate(item.endDate),
        isPresent: !item.endDate
      });
    } else if (type === 'certifications') {
      setCertForm({
        name: item.name || '',
        issuer: item.issuer || '',
        date: toInputDate(item.date),
        url: item.url || ''
      });
    } else if (type === 'achievements') {
      setAchForm({
        title: item.title || '',
        date: toInputDate(item.date),
        description: item.description || ''
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
    setModalError('');
  };

  // Handle Save Education
  const handleSaveEducation = async (e) => {
    e.preventDefault();
    if (!eduForm.institution.trim() || !eduForm.degree.trim() || !eduForm.startDate) {
      setModalError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setModalError('');
    try {
      const payload = {
        institution: eduForm.institution.trim(),
        degree: eduForm.degree.trim(),
        fieldOfStudy: eduForm.fieldOfStudy.trim() || null,
        startDate: eduForm.startDate,
        endDate: eduForm.isPresent ? null : (eduForm.endDate || null)
      };

      if (editingItem) {
        const updated = await updateAdminEducation(editingItem.id, payload);
        setEducation(prev => prev.map(item => item.id === editingItem.id ? updated : item));
      } else {
        const created = await createAdminEducation(payload);
        setEducation(prev => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setModalError('Failed to save education. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Save Certification
  const handleSaveCertification = async (e) => {
    e.preventDefault();
    if (!certForm.name.trim() || !certForm.issuer.trim() || !certForm.date) {
      setModalError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setModalError('');
    try {
      const payload = {
        name: certForm.name.trim(),
        issuer: certForm.issuer.trim(),
        date: certForm.date,
        url: certForm.url.trim() || null
      };

      if (editingItem) {
        const updated = await updateAdminCertification(editingItem.id, payload);
        setCertifications(prev => prev.map(item => item.id === editingItem.id ? updated : item));
      } else {
        const created = await createAdminCertification(payload);
        setCertifications(prev => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setModalError('Failed to save certification. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Save Achievement
  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    if (!achForm.title.trim() || !achForm.date) {
      setModalError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setModalError('');
    try {
      const payload = {
        title: achForm.title.trim(),
        date: achForm.date,
        description: achForm.description.trim() || null
      };

      if (editingItem) {
        const updated = await updateAdminAchievement(editingItem.id, payload);
        setAchievements(prev => prev.map(item => item.id === editingItem.id ? updated : item));
      } else {
        const created = await createAdminAchievement(payload);
        setAchievements(prev => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setModalError('Failed to save achievement. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { type, id } = deleteTarget;
      if (type === 'education') {
        await deleteAdminEducation(id);
        setEducation(prev => prev.filter(item => item.id !== id));
      } else if (type === 'certifications') {
        await deleteAdminCertification(id);
        setCertifications(prev => prev.filter(item => item.id !== id));
      } else if (type === 'achievements') {
        await deleteAdminAchievement(id);
        setAchievements(prev => prev.filter(item => item.id !== id));
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete item. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: 'education', name: 'Education', count: education.length },
    { id: 'certifications', name: 'Certifications', count: certifications.length },
    { id: 'achievements', name: 'Achievements', count: achievements.length },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Credentials &amp; Background
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your Education history, Certificates &amp; Licenses, and Career Achievements
          </p>
        </div>

        {/* Add Button for Active Tab */}
        <button
          onClick={() => openAddModal(activeTab)}
          className="self-start sm:self-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {activeTab === 'education' ? 'Education' : activeTab === 'certifications' ? 'Certification' : 'Achievement'}
        </button>
      </div>

      {/* Sub-Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.name}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
              activeTab === tab.id
                ? 'bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Loading credentials...</span>
        </div>
      ) : (
        <div>
          {/* 1. EDUCATION TAB */}
          {activeTab === 'education' && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              {education.length === 0 ? (
                <div className="py-16 text-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">No education records yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">Add your university, college, or school degree details.</p>
                  <button
                    onClick={() => openAddModal('education')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    + Add Education
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-[#090D16] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Degree / Course</th>
                      <th className="px-6 py-3.5">Institution</th>
                      <th className="px-6 py-3.5">Dates</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {education.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{item.degree}</div>
                          {item.fieldOfStudy && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.fieldOfStudy}</div>}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                          {item.institution}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                          {formatDate(item.startDate)} — {item.endDate ? formatDate(item.endDate) : <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Present</span>}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                            onClick={() => openEditModal('education', item)}
                            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'education', id: item.id, title: `${item.degree} at ${item.institution}` })}
                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 2. CERTIFICATIONS TAB */}
          {activeTab === 'certifications' && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              {certifications.length === 0 ? (
                <div className="py-16 text-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">No certifications yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">Add your technical certificates, licenses, and verified courses.</p>
                  <button
                    onClick={() => openAddModal('certifications')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    + Add Certification
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-[#090D16] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Certificate</th>
                      <th className="px-6 py-3.5">Issuer</th>
                      <th className="px-6 py-3.5">Issue Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {certifications.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 mt-0.5">
                              <span>Credential link</span> &rarr;
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                          {item.issuer}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                            onClick={() => openEditModal('certifications', item)}
                            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'certifications', id: item.id, title: item.name })}
                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 3. ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              {achievements.length === 0 ? (
                <div className="py-16 text-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">No achievements yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">Add your hackathon wins, awards, honors, and notable accomplishments.</p>
                  <button
                    onClick={() => openAddModal('achievements')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    + Add Achievement
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-[#090D16] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Achievement</th>
                      <th className="px-6 py-3.5">Description</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {achievements.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{item.title}</div>
                        </td>
                        <td className="px-6 py-4 max-w-md text-xs text-slate-600 dark:text-slate-400">
                          {item.description || '—'}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                            onClick={() => openEditModal('achievements', item)}
                            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'achievements', id: item.id, title: item.title })}
                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'education' ? 'Education' : modalType === 'certifications' ? 'Certification' : 'Achievement'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Alert */}
            {modalError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                {modalError}
              </div>
            )}

            {/* EDUCATION FORM */}
            {modalType === 'education' && (
              <form onSubmit={handleSaveEducation} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Institution <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stanford University"
                    value={eduForm.institution}
                    onChange={e => setEduForm(p => ({ ...p, institution: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Degree <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bachelor of Technology"
                    value={eduForm.degree}
                    onChange={e => setEduForm(p => ({ ...p, degree: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Field of Study</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science and Engineering"
                    value={eduForm.fieldOfStudy}
                    onChange={e => setEduForm(p => ({ ...p, fieldOfStudy: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Start Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={eduForm.startDate}
                      onChange={e => setEduForm(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">End Date</label>
                    <input
                      type="date"
                      disabled={eduForm.isPresent}
                      value={eduForm.endDate}
                      onChange={e => setEduForm(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors disabled:opacity-40"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="edu-present"
                    checked={eduForm.isPresent}
                    onChange={e => setEduForm(p => ({ ...p, isPresent: e.target.checked, endDate: e.target.checked ? '' : p.endDate }))}
                    className="accent-slate-900 dark:accent-sky-500 rounded"
                  />
                  <label htmlFor="edu-present" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    I am currently studying here (Present)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer">
                    {saving ? 'Saving...' : editingItem ? 'Update Education' : 'Add Education'}
                  </button>
                </div>
              </form>
            )}

            {/* CERTIFICATION FORM */}
            {modalType === 'certifications' && (
              <form onSubmit={handleSaveCertification} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Certificate Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Certified Solutions Architect"
                    value={certForm.name}
                    onChange={e => setCertForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Issuer / Organization <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon Web Services, Google, Meta"
                    value={certForm.issuer}
                    onChange={e => setCertForm(p => ({ ...p, issuer: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Issue Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={certForm.date}
                    onChange={e => setCertForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Credential URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={certForm.url}
                    onChange={e => setCertForm(p => ({ ...p, url: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer">
                    {saving ? 'Saving...' : editingItem ? 'Update Certification' : 'Add Certification'}
                  </button>
                </div>
              </form>
            )}

            {/* ACHIEVEMENT FORM */}
            {modalType === 'achievements' && (
              <form onSubmit={handleSaveAchievement} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Achievement Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1st Place at HackDavis 2024"
                    value={achForm.title}
                    onChange={e => setAchForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={achForm.date}
                    onChange={e => setAchForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">Description</label>
                  <textarea
                    rows="4"
                    placeholder="Briefly describe your achievement, impact, or recognition..."
                    value={achForm.description}
                    onChange={e => setAchForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none transition-colors"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer">
                    {saving ? 'Saving...' : editingItem ? 'Update Achievement' : 'Add Achievement'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">{deleteTarget.title}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
