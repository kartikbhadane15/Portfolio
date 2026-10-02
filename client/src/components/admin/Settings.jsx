import { useState, useEffect } from 'react';
import {
  fetchAdminSettings,
  updateAdminSettings,
  updateAdminPassword,
  updateAdminEmail,
  exportAdminData
} from '../../utils/api';

const COLOR_PRESETS = [
  { name: 'Sky Cerulean', hex: '#0284C7', bgClass: 'bg-[#0284C7]' },
  { name: 'Ocean Cobalt', hex: '#2563EB', bgClass: 'bg-[#2563EB]' },
  { name: 'Steel Slate', hex: '#475569', bgClass: 'bg-[#475569]' },
  { name: 'Modern Emerald', hex: '#059669', bgClass: 'bg-[#059669]' },
  { name: 'Sunset Amber', hex: '#D97706', bgClass: 'bg-[#D97706]' },
  { name: 'Rosewood', hex: '#E11D48', bgClass: 'bg-[#E11D48]' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'career' | 'seo' | 'security'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Main Settings Form
  const [settings, setSettings] = useState({
    siteTitle: '',
    siteDescription: '',
    metaKeywords: '',
    defaultTheme: 'dark',
    accentColor: '#0284C7',
    isAvailableForHire: true,
    availabilityStatus: '',
    resumeUrl: '',
    showExperience: true,
    showProjects: true,
    showSkills: true,
    showCredentials: true,
    showContact: true
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Email Form
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [emailSaving, setEmailSaving] = useState(false);

  // Exporting
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSettings();
      if (data) {
        setSettings({
          siteTitle: data.siteTitle || 'Kartik Bhadane | Software Engineer',
          siteDescription: data.siteDescription || '',
          metaKeywords: data.metaKeywords || '',
          defaultTheme: data.defaultTheme || 'dark',
          accentColor: data.accentColor || '#0284C7',
          isAvailableForHire: data.isAvailableForHire !== undefined ? data.isAvailableForHire : true,
          availabilityStatus: data.availabilityStatus || '',
          resumeUrl: data.resumeUrl || '',
          showExperience: data.showExperience !== undefined ? data.showExperience : true,
          showProjects: data.showProjects !== undefined ? data.showProjects : true,
          showSkills: data.showSkills !== undefined ? data.showSkills : true,
          showCredentials: data.showCredentials !== undefined ? data.showCredentials : true,
          showContact: data.showContact !== undefined ? data.showContact : true
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setStatusMessage({ type: 'error', text: 'Failed to load site settings.' });
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage({ type: '', text: '' });
    }, 5000);
  };

  // Handle Save Main Settings (Appearance, Career, SEO)
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateAdminSettings(settings);
      setSettings(prev => ({ ...prev, ...updated }));

      // Immediately apply accent color in real-time
      if (settings.accentColor) {
        document.documentElement.style.setProperty('--accent-color', settings.accentColor);
        document.documentElement.style.setProperty('--color-cyan-accent', settings.accentColor);
      }

      showNotification('success', 'Settings updated successfully!');
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showNotification('error', 'New password must be at least 6 characters.');
      return;
    }
    setPasswordSaving(true);
    try {
      await updateAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification('success', 'Admin password changed successfully!');
    } catch (err) {
      console.error(err);
      showNotification('error', err.response?.data?.error || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle Email Update
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.email.trim()) {
      showNotification('error', 'Please enter a valid email.');
      return;
    }
    setEmailSaving(true);
    try {
      await updateAdminEmail({ email: emailForm.email.trim() });
      setEmailForm({ email: '' });
      showNotification('success', 'Admin login email updated successfully!');
    } catch (err) {
      console.error(err);
      showNotification('error', err.response?.data?.error || 'Failed to update login email.');
    } finally {
      setEmailSaving(false);
    }
  };

  // Handle Data Export
  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await exportAdminData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('success', 'Portfolio data exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      showNotification('error', 'Failed to export portfolio backup.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500">Loading settings...</span>
      </div>
    );
  }

  const tabs = [
    {
      id: 'appearance',
      name: 'Theme & Palette',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21a4 4 0 01-4-4 4 4 0 014-4c.78 0 1.5.22 2.11.6l4.28-4.28a3 3 0 014.24 0l1.41 1.41a3 3 0 010 4.24l-4.28 4.28c.38.61.6 1.33.6 2.11a4 4 0 01-4 4zm0 0h12" />
        </svg>
      )
    },
    {
      id: 'career',
      name: 'Career & Status',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'seo',
      name: 'SEO & Sections',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    },
    {
      id: 'security',
      name: 'Security & Backup',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Customization
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure website color palettes, career availability, SEO metadata, and security.
        </p>
      </div>

      {/* Notification Toast */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 transition-colors ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400'
          }`}
        >
          <span className="font-bold">{statusMessage.type === 'success' ? '✓' : '!'}</span>
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: THEME & PALETTES */}
      {activeTab === 'appearance' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
            
            {/* Default Theme Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Default Website Theme
              </label>
              <p className="text-xs text-slate-500 mb-4">
                Choose the initial mode visitors experience when landing on your portfolio.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <div
                  onClick={() => setSettings(p => ({ ...p, defaultTheme: 'dark' }))}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    settings.defaultTheme === 'dark'
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-900/10 dark:ring-white/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-[#090D16] text-white flex items-center justify-center border border-slate-800">
                    <svg className="w-4 h-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">Dark Mode</div>
                    <div className="text-xs text-slate-400">Deep obsidian & slate aesthetic</div>
                  </div>
                </div>

                <div
                  onClick={() => setSettings(p => ({ ...p, defaultTheme: 'light' }))}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    settings.defaultTheme === 'light'
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-900/10 dark:ring-white/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white text-amber-500 flex items-center justify-center border border-slate-200 shadow-2xs">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">Light Mode</div>
                    <div className="text-xs text-slate-400">Crisp, clean high-contrast presentation</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80"></div>

            {/* Accent Color Customizer */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Portfolio Color Palette & Accent
              </label>
              <p className="text-xs text-slate-500 mb-4">
                Select your curated brand accent. This color adapts cleanly across buttons, active badges, and interactive indicators.
              </p>

              {/* Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = settings.accentColor?.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => {
                        setSettings(p => ({ ...p, accentColor: preset.hex }));
                        document.documentElement.style.setProperty('--accent-color', preset.hex);
                        document.documentElement.style.setProperty('--color-cyan-accent', preset.hex);
                      }}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/30 bg-slate-50 dark:bg-slate-800/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full shadow-2xs ${preset.bgClass}`} />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex input */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="color"
                  value={settings.accentColor || '#0284C7'}
                  onChange={e => {
                    const val = e.target.value;
                    setSettings(p => ({ ...p, accentColor: val }));
                    document.documentElement.style.setProperty('--accent-color', val);
                    document.documentElement.style.setProperty('--color-cyan-accent', val);
                  }}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-1"
                />
                <input
                  type="text"
                  value={settings.accentColor || '#0284C7'}
                  onChange={e => {
                    const val = e.target.value;
                    setSettings(p => ({ ...p, accentColor: val }));
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      document.documentElement.style.setProperty('--accent-color', val);
                      document.documentElement.style.setProperty('--color-cyan-accent', val);
                    }
                  }}
                  placeholder="#0284C7"
                  className="w-36 bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-slate-900 dark:text-white uppercase outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-400">Custom Brand Hex</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80"></div>

            {/* Live Appearance Preview Card */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                Live Theme Preview:
              </label>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border"
                    style={{
                      borderColor: `${settings.accentColor || '#0284C7'}40`,
                      backgroundColor: `${settings.accentColor || '#0284C7'}15`,
                      color: settings.accentColor || '#0284C7'
                    }}
                  >
                    <span>●</span> Enterprise Accent
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Preview of your custom palette styling
                  </h4>
                  <p className="text-xs text-slate-500">
                    Demonstrating calibrated brand color: {settings.accentColor}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    style={{ backgroundColor: settings.accentColor || '#0284C7' }}
                    className="px-4 py-2 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Sample Action
                  </button>
                  <span
                    style={{ color: settings.accentColor || '#0284C7' }}
                    className="text-xs sm:text-sm font-semibold cursor-pointer hover:underline"
                  >
                    Sample Link &rarr;
                  </span>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Theme & Appearance'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CAREER & AVAILABILITY */}
      {activeTab === 'career' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            
            {/* Availability Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${settings.isAvailableForHire ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-slate-400'}`} />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Available for Opportunities / Hire
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Controls the live status indicator on your portfolio Hero and Contact sections.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isAvailableForHire}
                  onChange={e => setSettings(p => ({ ...p, isAvailableForHire: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Custom Headline / Status Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Availability Headline / Target Opportunity
              </label>
              <input
                type="text"
                value={settings.availabilityStatus || ''}
                onChange={e => setSettings(p => ({ ...p, availabilityStatus: e.target.value }))}
                placeholder="e.g. Open to Senior Full Stack and AI Engineering opportunities"
                className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">
                Shown under "Let's Connect" in your contact section and on the hero badge.
              </p>
            </div>

            {/* Resume Link */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Resume / CV Link
              </label>
              <input
                type="url"
                value={settings.resumeUrl || ''}
                onChange={e => setSettings(p => ({ ...p, resumeUrl: e.target.value }))}
                placeholder="https://drive.google.com/... or direct link to your resume PDF"
                className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">
                When visitors click "Download CV" or "Resume", this link will open.
              </p>
            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Career Settings'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SEO & SECTION VISIBILITY */}
      {activeTab === 'seo' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            
            {/* SEO Metadata */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Search Engine Optimization (SEO)
              </h3>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Site Title</label>
                <input
                  type="text"
                  value={settings.siteTitle || ''}
                  onChange={e => setSettings(p => ({ ...p, siteTitle: e.target.value }))}
                  placeholder="Kartik Bhadane | Software Engineer"
                  className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Meta Description</label>
                <textarea
                  rows="3"
                  value={settings.siteDescription || ''}
                  onChange={e => setSettings(p => ({ ...p, siteDescription: e.target.value }))}
                  placeholder="Portfolio of Kartik Bhadane - Full stack software engineer..."
                  className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Meta Keywords</label>
                <input
                  type="text"
                  value={settings.metaKeywords || ''}
                  onChange={e => setSettings(p => ({ ...p, metaKeywords: e.target.value }))}
                  placeholder="Software Engineer, React, Full Stack, Cloud, AI"
                  className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80"></div>

            {/* Section Visibility Switches */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Section Visibility Toggles
              </h3>
              <p className="text-xs text-slate-500">
                Control which portfolio sections appear on the live website.
              </p>

              <div className="space-y-2.5 pt-1">
                {[
                  { key: 'showExperience', label: 'Work Experience Section', desc: 'Display roles, companies, and timeline' },
                  { key: 'showProjects', label: 'Featured Projects Section', desc: 'Display curated project cards and tags' },
                  { key: 'showSkills', label: 'Technical Arsenal & Skills Section', desc: 'Display frontend, backend, and tools skills' },
                  { key: 'showCredentials', label: 'Extra Credentials Section', desc: 'Display Education, Certifications & Achievements' },
                  { key: 'showContact', label: 'Contact Form Section', desc: 'Display direct inquiry contact form' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[item.key])}
                      onChange={e => setSettings(p => ({ ...p, [item.key]: e.target.checked }))}
                      className="w-4 h-4 accent-slate-900 dark:accent-white cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save SEO & Visibility'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: SECURITY & BACKUP */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          {/* Change Password Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Change Admin Password
                </h3>
                <p className="text-xs text-slate-400">Ensure your administrative access credentials stay secure.</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">New Password (min 6 characters)</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Change Login Email Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Change Admin Login Email
                </h3>
                <p className="text-xs text-slate-400">Update the primary account recovery and notifications address.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateEmail} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">New Login Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@yourdomain.com"
                  value={emailForm.email}
                  onChange={e => setEmailForm({ email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={emailSaving}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {emailSaving ? 'Updating...' : 'Update Login Email'}
              </button>
            </form>
          </div>

          {/* Data Export & Backup Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Portfolio Data Backup & Export
                </h3>
                <p className="text-xs text-slate-400">Download a full snapshot of your projects, experience, credentials, and settings.</p>
              </div>
            </div>

            <button
              type="button"
              disabled={exporting}
              onClick={handleExportData}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>{exporting ? 'Exporting...' : 'Download JSON Backup'}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>

          {/* System Health Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Database & API Status</h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">PostgreSQL via Supabase & Express API are operational.</p>
            </div>
            <span className="text-2xs font-mono font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
              HEALTHY
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
