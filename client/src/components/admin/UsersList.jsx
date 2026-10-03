import { useState, useEffect } from 'react';
import {
  fetchAdminUsers,
  createAdminUser,
  resetAdminUserPassword,
  deleteAdminUser,
  toggleAdminUserBlock,
  updateAdminUserSubscription
} from '../../utils/api';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Form State for New User
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    subscriptionDurationMonths: 1
  });

  // Password reset modal state
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Block modal state
  const [blockTarget, setBlockTarget] = useState(null);
  const [blocking, setBlocking] = useState(false);

  // Subscription modal state
  const [subscriptionTarget, setSubscriptionTarget] = useState(null);
  const [subMonths, setSubMonths] = useState(1);
  const [extendCurrent, setExtendCurrent] = useState(false);
  const [submittingSub, setSubmittingSub] = useState(false);

  const [copiedLink, setCopiedLink] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(''), 4000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!form.name.trim() || !form.username.trim() || !form.email.trim() || !form.password) {
      setModalError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setModalError('Password must be at least 6 characters.');
      return;
    }

    setCreating(true);
    try {
      const duration = parseInt(form.subscriptionDurationMonths) || 1;
      await createAdminUser({
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        subscriptionDurationMonths: duration
      });

      setSuccessInfo({
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        durationMonths: duration,
        url: `${window.location.origin}/${form.username.trim().toLowerCase()}`
      });

      setForm({ name: '', username: '', email: '', password: '', subscriptionDurationMonths: 1 });
      loadUsers();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.error || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setResetting(true);
    try {
      await resetAdminUserPassword(resetTarget.id, newPassword);
      showToast(`Password for @${resetTarget.username} updated successfully!`);
      setResetTarget(null);
      setNewPassword('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      showToast(`User @${deleteTarget.username} deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!blockTarget) return;
    setBlocking(true);
    const newBlockedState = !blockTarget.isBlocked;
    try {
      const res = await toggleAdminUserBlock(blockTarget.id, newBlockedState);
      setUsers(prev => prev.map(u => u.id === blockTarget.id ? { ...u, ...res.user } : u));
      showToast(res.message || (newBlockedState ? `Blocked @${blockTarget.username}` : `Unblocked @${blockTarget.username}`));
      setBlockTarget(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to change block status.');
    } finally {
      setBlocking(false);
    }
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    if (!subscriptionTarget) return;
    setSubmittingSub(true);
    try {
      const res = await updateAdminUserSubscription(subscriptionTarget.id, {
        durationMonths: subMonths,
        extendCurrent: extendCurrent
      });
      setUsers(prev => prev.map(u => u.id === subscriptionTarget.id ? { ...u, ...res.user } : u));
      showToast(res.message || `Subscription updated for @${subscriptionTarget.username}!`);
      setSubscriptionTarget(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update subscription.');
    } finally {
      setSubmittingSub(false);
    }
  };

  const handleCopy = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  // Helper to calculate status badge info
  const getUserStatus = (user) => {
    if (user.role === 'superadmin') {
      return {
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        label: 'Lifetime Access',
        detail: 'Exempt from subscription limits',
        isSuper: true
      };
    }

    if (user.isBlocked) {
      return {
        badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-850',
        dotClass: 'bg-rose-500',
        label: 'Blocked',
        detail: 'Hidden from public & login blocked'
      };
    }

    if (!user.subscriptionExpiresAt) {
      return {
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-850',
        dotClass: 'bg-amber-500',
        label: 'Inactive',
        detail: 'No active subscription period set'
      };
    }

    const expDate = new Date(user.subscriptionExpiresAt);
    const now = new Date();
    const diffMs = expDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs <= 0) {
      return {
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-850',
        dotClass: 'bg-amber-500',
        label: 'Expired',
        detail: `Ended ${expDate.toLocaleDateString()}`
      };
    }

    return {
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-850',
      dotClass: 'bg-emerald-500',
      label: 'Active',
      detail: `Valid until ${expDate.toLocaleDateString()} (${diffDays}d left)`
    };
  };

  // Calculate preview expiration date for the subscription modal
  const calculatePreviewExpiry = () => {
    if (!subscriptionTarget) return '';
    const now = new Date();
    let base = now;
    if (extendCurrent && subscriptionTarget.subscriptionExpiresAt && new Date(subscriptionTarget.subscriptionExpiresAt) > now) {
      base = new Date(subscriptionTarget.subscriptionExpiresAt);
    }
    const target = new Date(base);
    target.setMonth(target.getMonth() + parseInt(subMonths || 1));
    return target.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Toast Alert */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Superadmin Control
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            User Accounts & Portfolios
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage user subscriptions, set access duration in months, and block or unblock public portfolio visibility
          </p>
        </div>

        <button
          onClick={() => {
            setModalOpen(true);
            setSuccessInfo(null);
            setModalError('');
          }}
          className="self-start sm:self-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl transition-colors text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New User
        </button>
      </div>

      {/* USERS TABLE */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading user accounts...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-[#090D16] text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Username & Public Link</th>
                <th className="px-6 py-4">Subscription & Visibility</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Projects</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60">
              {users.map((u) => {
                const portfolioUrl = `${window.location.origin}/${u.username}`;
                const status = getUserStatus(u);

                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    
                    {/* 1. User Info */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {u.profile?.name || u.email}
                      </div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>

                    {/* 2. Username & Link */}
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        @{u.username}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:underline flex items-center gap-1"
                        >
                          <span>Open link</span> &rarr;
                        </a>
                        <button
                          onClick={() => handleCopy(portfolioUrl, u.id)}
                          className="text-2xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedLink === u.id ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </td>

                    {/* 3. Subscription & Visibility Status */}
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.badgeClass}`}>
                          {status.dotClass && <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />}
                          {status.label}
                        </span>
                        <div className="text-2xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                          {status.detail}
                        </div>
                      </div>
                    </td>

                    {/* 4. Role */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'superadmin'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-mono'
                          : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-850'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* 5. Projects */}
                    <td className="px-6 py-4 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{u._count?.projects || 0}</span> projects
                    </td>

                    {/* 6. Actions */}
                    <td className="px-6 py-4 text-right space-x-2.5">
                      {u.role !== 'superadmin' && (
                        <>
                          {/* Manage Subscription Button */}
                          <button
                            onClick={() => {
                              setSubscriptionTarget(u);
                              setSubMonths(u.subscriptionDurationMonths || 1);
                              setExtendCurrent(Boolean(u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt) > new Date()));
                            }}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-850 transition-colors cursor-pointer"
                            title="Set duration and activate portfolio"
                          >
                            Subscription
                          </button>

                          {/* Block / Unblock Toggle */}
                          <button
                            onClick={() => setBlockTarget(u)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                              u.isBlocked
                                ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-850'
                                : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-850'
                            }`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </>
                      )}

                      {/* Reset Password */}
                      <button
                        onClick={() => {
                          setResetTarget(u);
                          setNewPassword('');
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                      >
                        Reset Password
                      </button>

                      {/* Delete */}
                      {u.role !== 'superadmin' && (
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. MANAGE SUBSCRIPTION MODAL */}
      {/* ============================================================== */}
      {subscriptionTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !submittingSub) setSubscriptionTarget(null); }}
        >
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📅</span> Manage Subscription Duration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Set how many months portfolio remains active for <span className="font-mono text-sky-500 font-bold">@{subscriptionTarget.username}</span>
                </p>
              </div>
              <button
                onClick={() => setSubscriptionTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateSubscription} className="p-6 space-y-5">
              
              {/* Current Status banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400">Current Status: </span>
                  <span className={`font-bold ${subscriptionTarget.isBlocked ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
                    {subscriptionTarget.isBlocked ? 'Blocked' : (subscriptionTarget.subscriptionExpiresAt ? (new Date(subscriptionTarget.subscriptionExpiresAt) < new Date() ? 'Expired' : 'Active') : 'Inactive')}
                  </span>
                </div>
                <div className="font-mono text-slate-500">
                  {subscriptionTarget.subscriptionExpiresAt
                    ? `Expires: ${new Date(subscriptionTarget.subscriptionExpiresAt).toLocaleDateString()}`
                    : 'No Expiry Set'}
                </div>
              </div>

              {/* Duration selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Subscription Period (Months)
                </label>
                
                {/* Preset Chips */}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 6, 12].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setSubMonths(m)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        subMonths === m
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                          : 'bg-slate-50 dark:bg-[#090D16] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      {m} {m === 1 ? 'Month' : 'Months'}
                    </button>
                  ))}
                </div>

                {/* Custom Month Input */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-slate-500">Or custom months:</span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={subMonths}
                    onChange={(e) => setSubMonths(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-sky-500"
                  />
                  <span className="text-xs text-slate-500 font-mono">month(s)</span>
                </div>
              </div>

              {/* Optional: Extend from existing expiry */}
              {subscriptionTarget.subscriptionExpiresAt && new Date(subscriptionTarget.subscriptionExpiresAt) > new Date() && (
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090D16]/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extendCurrent}
                    onChange={(e) => setExtendCurrent(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Extend from current expiration date ({new Date(subscriptionTarget.subscriptionExpiresAt).toLocaleDateString()}) instead of today
                  </span>
                </label>
              )}

              {/* Expiry Date Calculation Preview */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs space-y-1">
                <div className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                  <span>✨</span> Resulting Visibility Period
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Portfolio will be publicly visible and active until: <strong className="text-slate-900 dark:text-white font-mono">{calculatePreviewExpiry()}</strong>
                </p>
                {subscriptionTarget.isBlocked && (
                  <p className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Note: Activating this subscription will automatically unblock this user.
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubscriptionTarget(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSub}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingSub ? 'Saving...' : `Activate (${subMonths} ${subMonths === 1 ? 'Month' : 'Months'})`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. BLOCK / UNBLOCK CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {blockTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => { if (!blocking) setBlockTarget(null); }}
        >
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                blockTarget.isBlocked ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
              }`}>
                {blockTarget.isBlocked ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {blockTarget.isBlocked ? `Unblock User @${blockTarget.username}` : `Block User @${blockTarget.username}`}
                </h3>
                <p className="text-xs text-slate-500">
                  {blockTarget.isBlocked ? 'Restore public visibility' : 'Hide portfolio and suspend login'}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              {blockTarget.isBlocked ? (
                <>
                  Are you sure you want to <strong>unblock @{blockTarget.username}</strong>? Their portfolio will become publicly accessible again (subject to their active subscription).
                </>
              ) : (
                <>
                  Are you sure you want to <strong>block @{blockTarget.username}</strong>?
                  Their public URL (<span className="font-mono text-xs">{window.location.origin}/{blockTarget.username}</span>) will immediately be hidden from all public visitors. 
                  Only you (as superadmin) will be able to view it.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={blocking}
                onClick={() => setBlockTarget(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={blocking}
                onClick={handleToggleBlock}
                className={`px-5 py-2 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer ${
                  blockTarget.isBlocked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {blocking ? 'Processing...' : (blockTarget.isBlocked ? 'Confirm Unblock' : 'Confirm Block User')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CREATE NEW USER MODAL (With Subscription Duration) */}
      {/* ============================================================== */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !creating) setModalOpen(false); }}
        >
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Create User & Portfolio Credentials
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Banner */}
            {modalError && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                {modalError}
              </div>
            )}

            {/* SUCCESS BANNER */}
            {successInfo ? (
              <div className="p-6 space-y-5">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>✓</span> Account Created Successfully!
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    The portfolio has been activated for <strong className="font-bold">{successInfo.durationMonths} month(s)</strong>. Share credentials with user:
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 space-y-2.5 font-mono text-xs">
                  <div>
                    <span className="text-slate-400">Public Link: </span>
                    <a href={successInfo.url} target="_blank" rel="noreferrer" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">
                      {successInfo.url}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400">Login Email: </span>
                    <span className="text-slate-900 dark:text-white font-bold">{successInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Password: </span>
                    <span className="text-slate-900 dark:text-white font-bold">{successInfo.password}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Subscription: </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{successInfo.durationMonths} Month(s) Active</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSuccessInfo(null);
                      setModalOpen(false);
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Robinson"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Username / Slug <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2 border border-r-0 border-slate-200 dark:border-slate-800 rounded-l-xl text-xs font-mono text-slate-400">
                      /
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="alex"
                      value={form.username}
                      onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
                      className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-r-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                  </div>
                  <p className="text-2xs text-slate-400 mt-1">
                    Their live portfolio will be at: <span className="text-sky-600 dark:text-sky-400 font-mono">{window.location.origin}/{form.username || 'username'}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Login Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                {/* Subscription Duration in Months */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Subscription Duration (Months)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 6, 12].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setForm(p => ({ ...p, subscriptionDurationMonths: m }))}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                          form.subscriptionDurationMonths === m
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                            : 'bg-slate-50 dark:bg-[#090D16] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {m} {m === 1 ? 'Month' : 'Mos'}
                      </button>
                    ))}
                  </div>
                  <p className="text-2xs text-slate-400">
                    Portfolio will be shown publicly for this duration starting immediately after creation.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. RESET PASSWORD MODAL */}
      {/* ============================================================== */}
      {resetTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setResetTarget(null)}
        >
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset Password for @{resetTarget.username}
            </h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">New Password</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {resetting ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete User Account</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">@{deleteTarget.username}</span>? This will permanently delete their profile, projects, and all portfolio data.
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
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
