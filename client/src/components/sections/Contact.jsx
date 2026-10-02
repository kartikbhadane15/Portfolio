import { useEffect, useState } from 'react';
import { fetchProfile, submitContactMessage, submitPublicContactMessage } from '../../utils/api';

function formatDisplay(url) {
  if (!url) return '';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace('www.', '') + u.pathname;
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '');
  }
}

export default function Contact({ settings, profileData, username }) {
  const [profile, setProfile] = useState(profileData || null);

  // Form state
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      return;
    }
    fetchProfile()
      .then(data => setProfile(data))
      .catch(err => console.error('Failed to load profile for contact:', err));
  }, [profileData]);

  const email = profile?.email;
  const linkedin = profile?.linkedinUrl;
  const github = profile?.githubUrl;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (status.text) setStatus({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMsg = form.message.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setStatus({ type: 'error', text: 'Please enter your name (at least 2 characters).' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    if (!trimmedMsg || trimmedMsg.length < 10) {
      setStatus({ type: 'error', text: 'Please write a message with at least 10 characters.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMsg
      };

      const res = username 
        ? await submitPublicContactMessage(username, payload)
        : await submitContactMessage(payload);

      setStatus({
        type: 'success',
        text: res.message || 'Message sent successfully! Thank you for reaching out.'
      });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact submission error:', err);
      const msg = err.response?.data?.error || 'Failed to send message. Please try again later.';
      setStatus({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Left Side: Info */}
        <div className="flex flex-col items-start space-y-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Let's Connect</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md">
            {settings?.availabilityStatus || "Interested in working together? I'm currently looking for full-time software engineering opportunities for 2027."}
          </p>
          
          <div className="space-y-6 pt-4">
            {/* Email */}
            {email && (
              <a
                href={`mailto:${email}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 text-gray-600 dark:text-gray-300 hover:text-cyan-accent dark:hover:text-cyan-accent transition-colors group"
              >
                <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-dark-card flex items-center justify-center group-hover:border-cyan-accent group-hover:bg-cyan-accent/10 transition-colors flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span className="break-all">{email}</span>
              </a>
            )}

            {/* LinkedIn */}
            {linkedin && (
              <a
                href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 text-gray-600 dark:text-gray-300 hover:text-cyan-accent dark:hover:text-cyan-accent transition-colors group"
              >
                <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-dark-card flex items-center justify-center group-hover:border-cyan-accent group-hover:bg-cyan-accent/10 transition-colors flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <span className="break-all">{formatDisplay(linkedin)}</span>
              </a>
            )}

            {/* GitHub */}
            {github && (
              <a
                href={github.startsWith('http') ? github : `https://${github}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 text-gray-600 dark:text-gray-300 hover:text-cyan-accent dark:hover:text-cyan-accent transition-colors group"
              >
                <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-dark-card flex items-center justify-center group-hover:border-cyan-accent group-hover:bg-cyan-accent/10 transition-colors flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </div>
                <span className="break-all">{formatDisplay(github)}</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="bg-white dark:bg-dark-card p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Status Alert Banner */}
            {status.text && (
              <div
                className={`p-4 rounded-xl text-sm flex items-start gap-3 transition-all ${
                  status.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300'
                }`}
              >
                {status.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span>{status.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Name <span className="text-cyan-accent">*</span>
                </label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Doe" 
                  className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-accent focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Email <span className="text-cyan-accent">*</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@example.com" 
                  className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-accent focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Message <span className="text-cyan-accent">*</span>
              </label>
              <textarea 
                rows="5"
                name="message"
                required
                value={form.message}
                onChange={handleChange}
                placeholder="How can I help you?" 
                className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-accent focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-cyan-accent text-black font-bold text-lg py-4 rounded-xl hover:bg-cyan-accent/90 transition-colors shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <span>Send Message</span>
              )}
            </button>
          </form>
        </div>
        
      </div>
    </section>
  );
}
