import { useState, useEffect, useMemo } from 'react';
import { fetchAdminMessages, toggleMessageReadStatus, deleteAdminMessage } from '../../utils/api';

function formatMessageDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

  // Selected message for details modal/drawer
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Message to delete (triggers confirmation dialog)
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminMessages();
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const totalCount = messages.length;
  const unreadCount = useMemo(() => messages.filter(m => !m.isRead).length, [messages]);
  const readCount = totalCount - unreadCount;

  // Filtered and searched messages
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      // Filter tab
      if (filter === 'unread' && m.isRead) return false;
      if (filter === 'read' && !m.isRead) return false;

      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const inName = m.name?.toLowerCase().includes(q);
        const inEmail = m.email?.toLowerCase().includes(q);
        const inMsg = m.message?.toLowerCase().includes(q);
        return inName || inEmail || inMsg;
      }

      return true;
    });
  }, [messages, filter, search]);

  // Open message details & mark as read automatically if unread
  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        const updated = await toggleMessageReadStatus(msg.id, true);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
        setSelectedMessage(updated);
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  // Toggle Read / Unread status
  const handleToggleRead = async (e, msg) => {
    e.stopPropagation();
    try {
      const newStatus = !msg.isRead;
      const updated = await toggleMessageReadStatus(msg.id, newStatus);
      setMessages(prev => prev.map(m => m.id === msg.id ? updated : m));
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(updated);
      }
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    }
  };

  // Confirm delete message
  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setDeleting(true);
    try {
      await deleteAdminMessage(messageToDelete.id);
      setMessages(prev => prev.filter(m => m.id !== messageToDelete.id));
      if (selectedMessage?.id === messageToDelete.id) {
        setSelectedMessage(null);
      }
      setMessageToDelete(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Contact Messages
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {totalCount} total message{totalCount !== 1 ? 's' : ''} received through your portfolio contact form
          </p>
        </div>

        {/* Quick Refresh Button */}
        <button
          onClick={loadMessages}
          className="self-start sm:self-auto px-4 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search input */}
        <div className="relative flex-1">
          <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="w-full bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-[#090D16] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              filter === 'unread'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-[#090D16] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'read'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-[#090D16] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            Read ({readCount})
          </button>
        </div>
      </div>

      {/* Message List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-24 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse p-4 flex flex-col justify-between" />
          ))}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl py-16 px-6 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          {search ? (
            <>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">No messages found</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                No inquiries match your search term "{search}".
              </p>
              <button
                onClick={() => setSearch('')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </>
          ) : filter !== 'all' ? (
            <>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No {filter} messages</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
                You don't have any messages in the {filter} inbox.
              </p>
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                View All Messages
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No messages yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Messages submitted through your portfolio contact form will appear here.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => {
            const isUnread = !msg.isRead;
            return (
              <div
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isUnread
                    ? 'bg-sky-500/[0.04] dark:bg-sky-500/[0.05] border-sky-500/30 shadow-xs hover:border-sky-500/50'
                    : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                }`}
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Status Indicator Dot */}
                  <span
                    className={`mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                      isUnread
                        ? 'bg-sky-500 ring-4 ring-sky-500/20'
                        : 'border border-slate-300 dark:border-slate-600'
                    }`}
                    title={isUnread ? 'Unread message' : 'Read message'}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className={`text-base font-semibold truncate ${
                        isUnread ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {msg.name}
                      </h4>
                      <span className="text-xs text-slate-400 font-mono truncate">
                        &lt;{msg.email}&gt;
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                </div>

                {/* Right meta & actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap font-mono">
                    {formatMessageDate(msg.createdAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleRead(e, msg)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                      title={msg.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {msg.isRead ? 'Mark Unread' : 'Mark Read'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessageToDelete(msg);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10 cursor-pointer"
                      title="Delete message"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message Details Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedMessage.isRead ? 'bg-slate-400' : 'bg-sky-500 ring-4 ring-sky-500/20'}`} />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedMessage.name}
                  </h3>
                </div>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="text-sm font-mono text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {selectedMessage.email}
                </a>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">
                  Received on {formatMessageDate(selectedMessage.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message Body */}
            <div className="p-6 max-h-[50vh] overflow-y-auto">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 font-mono">
                Message Content:
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-sm">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#090D16]">
              <div className="flex items-center gap-2">
                {/* Reply via email mailto */}
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re:%20Portfolio%20Inquiry&body=Hi%20${encodeURIComponent(selectedMessage.name)},%0A%0AThank%20you%20for%20reaching%20out!`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply via Email
                </a>

                {/* Mark read / unread toggle */}
                <button
                  onClick={(e) => handleToggleRead(e, selectedMessage)}
                  className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  {selectedMessage.isRead ? 'Mark as Unread' : 'Mark as Read'}
                </button>
              </div>

              {/* Delete button */}
              <button
                onClick={() => {
                  setMessageToDelete(selectedMessage);
                }}
                className="px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in-0 duration-150"
          onClick={() => setMessageToDelete(null)}
        >
          <div
            className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete this message?
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to delete the message from <span className="font-semibold text-gray-800 dark:text-gray-200">{messageToDelete.name}</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setMessageToDelete(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2"
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
