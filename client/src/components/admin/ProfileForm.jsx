import { useState, useEffect } from 'react';
import { fetchAdminProfile, updateAdminProfile, uploadProfilePhoto } from '../../utils/api';

export default function ProfileForm() {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    bio: '',
    email: '',
    photoUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    resumeUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAdminProfile().then(data => {
      if (data) {
        setFormData({
          name: data.name || '',
          tagline: data.tagline || '',
          bio: data.bio || '',
          email: data.email || '',
          photoUrl: data.photoUrl || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          twitterUrl: data.twitterUrl || '',
          resumeUrl: data.resumeUrl || ''
        });
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append('photo', file);

    try {
      const res = await uploadProfilePhoto(form);
      setFormData(prev => ({ ...prev, photoUrl: res.url }));
    } catch (err) {
      console.error('Error uploading file', err);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminProfile(formData);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Profile Settings</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">Manage your personal information and photo.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm transition-colors space-y-6">
        
        {/* Photo Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Profile Photo</label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 dark:bg-black rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden transition-colors">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-accent/10 file:text-cyan-accent hover:file:bg-cyan-accent/20 transition-colors"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">OR paste link:</span>
                <input
                  type="url"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-accent transition-colors"
                />
              </div>
            </div>
          </div>
          {uploading && <p className="text-sm text-cyan-accent mt-2">Uploading...</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-accent transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. Full Stack Developer"
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-accent transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Bio</label>
          <textarea
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-accent transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Contact Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. you@gmail.com"
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-accent transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">GitHub URL</label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-accent transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">LinkedIn URL</label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-accent transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Twitter URL</label>
            <input
              type="url"
              name="twitterUrl"
              value={formData.twitterUrl}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-accent transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Resume URL</label>
            <input
              type="url"
              name="resumeUrl"
              value={formData.resumeUrl}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-accent transition-colors"
            />
          </div>
        </div>


        <div className="flex justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-2.5 bg-cyan-accent text-black font-semibold rounded-lg hover:bg-cyan-accent/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
