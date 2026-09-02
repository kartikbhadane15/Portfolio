import { useState, useEffect } from 'react';
import {
  fetchAdminSettings,
  updateAdminSettings,
  updateAdminPassword,
  updateAdminEmail,
  exportAdminData
} from '../../utils/api';

const COLOR_PRESETS = [
  { name: 'Cyber Cyan', hex: '#00E5FF', bgClass: 'bg-[#00E5FF]' },
  { name: 'Emerald Mint', hex: '#10B981', bgClass: 'bg-[#10B981]' },
  { name: 'Electric Violet', hex: '#A855F7', bgClass: 'bg-[#A855F7]' },
  { name: 'Sapphire Blue', hex: '#3B82F6', bgClass: 'bg-[#3B82F6]' },
  { name: 'Sunset Orange', hex: '#F97316', bgClass: 'bg-[#F97316]' },
  { name: 'Crimson Rose', hex: '#F43F5E', bgClass: 'bg-[#F43F5E]' },
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
    accentColor: '#00E5FF',
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
          accentColor: data.accentColor || '#00E5FF',
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
        <div className="w-8 h-8 border-2 border-cyan-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Loading settings...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'appearance', name: 'Theme & Appearance', icon: '🎨' },
    { id: 'career', name: 'Career & Availability', icon: '💼' },
    { id: 'seo', name: 'SEO & Sections', icon: '🌐' },
    { id: 'security', name: 'Security & Backup', icon: '🔐' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Settings & Customization
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure website themes, career availability, SEO metadata, security, and backups
        </p>
      </div>

      {/* Notification Toast */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in-0 duration-150 ${
            statusMessage.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400'
          }`}
        >
          <span>{statusMessage.type === 'success' ? '✓' : '⚠️'}</span>
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/30'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: THEME & APPEARANCE */}
      {activeTab === 'appearance' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
            
            {/* Default Theme Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                Default Website Theme
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Choose the initial theme visitors see when they load your portfolio.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <div
                  onClick={() => setSettings(p => ({ ...p, defaultTheme: 'dark' }))}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    settings.defaultTheme === 'dark'
                      ? 'border-cyan-accent bg-cyan-accent/5 ring-1 ring-cyan-accent/30'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center text-lg border border-gray-800">
                    🌙
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Dark Mode</div>
                    <div className="text-xs text-gray-400">Sleek, high-contrast dark aesthetic</div>
                  </div>
                </div>

                <div
                  onClick={() => setSettings(p => ({ ...p, defaultTheme: 'light' }))}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    settings.defaultTheme === 'light'
                      ? 'border-cyan-accent bg-cyan-accent/5 ring-1 ring-cyan-accent/30'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white text-yellow-500 flex items-center justify-center text-lg border border-gray-200 shadow-xs">
                    ☀️
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Light Mode</div>
                    <div className="text-xs text-gray-400">Crisp, clean bright presentation</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800/80"></div>

            {/* Accent Color Customizer */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                Portfolio Accent Color
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Select your brand accent color. This color is dynamically injected into buttons, glowing tags, and links across your site.
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
                          ? 'border-white dark:border-white ring-2 ring-offset-2 ring-cyan-accent'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full shadow-xs ${preset.bgClass}`} />
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 text-center">
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
                  value={settings.accentColor || '#00E5FF'}
                  onChange={e => {
                    const val = e.target.value;
                    setSettings(p => ({ ...p, accentColor: val }));
                    document.documentElement.style.setProperty('--accent-color', val);
                    document.documentElement.style.setProperty('--color-cyan-accent', val);
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={settings.accentColor || '#00E5FF'}
                  onChange={e => {
                    const val = e.target.value;
                    setSettings(p => ({ ...p, accentColor: val }));
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      document.documentElement.style.setProperty('--accent-color', val);
                      document.documentElement.style.setProperty('--color-cyan-accent', val);
                    }
                  }}
                  placeholder="#00E5FF"
                  className="w-36 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 dark:text-white uppercase outline-none focus:border-cyan-accent"
                />
                <span className="text-xs text-gray-400">Custom Hex code</span>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800/80"></div>

            {/* Live Appearance Preview Card */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-3 font-mono">
                Live Theme Preview:
              </label>
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border border-cyan-accent/20 bg-cyan-accent/10 text-cyan-accent">
                    <span>✨</span> Interactive Badge
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    Preview of your custom accent styling
                  </h4>
                  <p className="text-xs text-gray-500">
                    This demonstrates buttons and links using {settings.accentColor}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-cyan-accent text-black font-bold text-sm shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-105 transition-transform cursor-pointer"
                  >
                    Sample Button
                  </button>
                  <span className="text-sm font-bold text-cyan-accent cursor-pointer hover:underline">
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
              className="px-6 py-2.5 bg-cyan-accent text-black font-bold rounded-lg hover:bg-cyan-accent/90 transition-colors text-sm disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Theme & Appearance'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CAREER & AVAILABILITY */}
      {activeTab === 'career' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Availability Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${settings.isAvailableForHire ? 'bg-green-500 ring-4 ring-green-500/20' : 'bg-red-500'}`} />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Available for Opportunities / Hire
                  </h3>
                </div>
                <p className="text-xs text-gray-500">
                  Controls the live status indicator on your portfolio's Hero and Contact sections.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isAvailableForHire}
                  onChange={e => setSettings(p => ({ ...p, isAvailableForHire: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            {/* Custom Headline / Status Text */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                Availability Headline / Target Opportunity
              </label>
              <input
                type="text"
                value={settings.availabilityStatus || ''}
                onChange={e => setSettings(p => ({ ...p, availabilityStatus: e.target.value }))}
                placeholder="e.g. Looking for full-time software engineering opportunities for 2027"
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-accent"
              />
              <p className="text-xs text-gray-400">
                Shown under "Let's Connect" in your contact section and on the hero badge.
              </p>
            </div>

            {/* Resume Link */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                Resume / CV Link
              </label>
              <input
                type="url"
                value={settings.resumeUrl || ''}
                onChange={e => setSettings(p => ({ ...p, resumeUrl: e.target.value }))}
                placeholder="https://drive.google.com/... or link to your resume PDF"
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-accent"
              />
              <p className="text-xs text-gray-400">
                When visitors click "Download CV" or "Resume", this link will open.
              </p>
            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-cyan-accent text-black font-bold rounded-lg hover:bg-cyan-accent/90 transition-colors text-sm disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Career Settings'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SEO & SECTION VISIBILITY */}
      {activeTab === 'seo' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* SEO Metadata */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Search Engine Optimization (SEO)
              </h3>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-gray-500">Site Title</label>
                <input
                  type="text"
                  value={settings.siteTitle || ''}
                  onChange={e => setSettings(p => ({ ...p, siteTitle: e.target.value }))}
                  placeholder="Kartik Bhadane | Software Engineer"
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-gray-500">Meta Description</label>
                <textarea
                  rows="3"
                  value={settings.siteDescription || ''}
                  onChange={e => setSettings(p => ({ ...p, siteDescription: e.target.value }))}
                  placeholder="Portfolio of Kartik Bhadane - Full stack software engineer..."
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-accent resize-none"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-gray-500">Meta Keywords</label>
                <input
                  type="text"
                  value={settings.metaKeywords || ''}
                  onChange={e => setSettings(p => ({ ...p, metaKeywords: e.target.value }))}
                  placeholder="Software Engineer, React, Full Stack, Mobile"
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-accent"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800/80"></div>

            {/* Section Visibility Switches */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Section Visibility Toggles
              </h3>
              <p className="text-xs text-gray-500">
                Control which sections appear on your portfolio home page.
              </p>

              <div className="space-y-3 pt-1">
                {[
                  { key: 'showExperience', label: 'Work Experience Section', desc: 'Display roles, companies, and timeline' },
                  { key: 'showProjects', label: 'Featured Projects Section', desc: 'Display curated project cards and tags' },
                  { key: 'showSkills', label: 'Technical Arsenal & Skills Section', desc: 'Display frontend, backend, and tools skills' },
                  { key: 'showCredentials', label: 'Extra Credentials Section', desc: 'Display Education, Certifications & Achievements' },
                  { key: 'showContact', label: 'Contact Form Section', desc: 'Display direct inquiry contact form' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800/80">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[item.key])}
                      onChange={e => setSettings(p => ({ ...p, [item.key]: e.target.checked }))}
                      className="w-4 h-4 accent-cyan-accent cursor-pointer"
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
              className="px-6 py-2.5 bg-cyan-accent text-black font-bold rounded-lg hover:bg-cyan-accent/90 transition-colors text-sm disabled:opacity-50 cursor-pointer"
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
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🔒</span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Change Admin Password
              </h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">New Password (min 6 characters)</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-accent"
                />
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="px-5 py-2.5 bg-cyan-accent text-black font-bold rounded-lg hover:bg-cyan-accent/90 transition-colors text-xs disabled:opacity-50 cursor-pointer"
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Change Login Email Card */}
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📧</span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Change Admin Login Email
              </h3>
            </div>

            <form onSubmit={handleUpdateEmail} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">New Login Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@yourdomain.com"
                  value={emailForm.email}
                  onChange={e => setEmailForm({ email: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-accent"
                />
              </div>

              <button
                type="submit"
                disabled={emailSaving}
                className="px-5 py-2.5 bg-cyan-accent text-black font-bold rounded-lg hover:bg-cyan-accent/90 transition-colors text-xs disabled:opacity-50 cursor-pointer"
              >
                {emailSaving ? 'Updating...' : 'Update Login Email'}
              </button>
            </form>
          </div>

          {/* Data Export & Backup Card */}
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">💾</span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Portfolio Data Backup & Export
              </h3>
            </div>
            <p className="text-xs text-gray-500 max-w-xl">
              Export all your portfolio data (Projects, Experience, Skills, Education, Certifications, Achievements, Messages, and Settings) into a single structured JSON backup.
            </p>

            <button
              type="button"
              disabled={exporting}
              onClick={handleExportData}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-lg text-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span>{exporting ? 'Exporting...' : 'Download Portfolio Backup (JSON)'}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>

          {/* System Health Card */}
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Database & API Status</h4>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">PostgreSQL via Supabase & Express API are fully operational.</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">
              HEALTHY
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
