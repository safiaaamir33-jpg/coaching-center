import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  CheckCircle2,
  Trash2,
  Clock,
  MessageSquare,
  Search,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  Filter
} from 'lucide-react';
import { ContactMessage } from '../../types';
import {
  getAllContactMessages,
  updateContactStatus,
  deleteContactMessage
} from '../../services/contactService';

export const ContactManager: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'resolved'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getAllContactMessages();
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: string, status: ContactMessage['status']) => {
    try {
      await updateContactStatus(id, status);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const [msgToDelete, setMsgToDelete] = useState<ContactMessage | null>(null);
  const [deletingMsg, setDeletingMsg] = useState(false);

  const confirmDeleteContact = async () => {
    if (!msgToDelete?.id) return;
    setDeletingMsg(true);
    try {
      await deleteContactMessage(msgToDelete.id);
      setMessages((prev) => prev.filter((m) => m.id !== msgToDelete.id));
      setMsgToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingMsg(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter((m) => m.status === 'new').length;

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Communications & Inquiries
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900 flex items-center gap-2">
            Client Messages Inbox (کلائنٹ میسجز)
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500">
            Real-time messages sent by parents, students, and visitors via the public website.
          </p>
        </div>

        <button
          onClick={loadMessages}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Inbox
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All (${messages.length})` },
            { id: 'new', label: `New / Unread (${unreadCount})` },
            { id: 'read', label: 'Read' },
            { id: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, message..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            Loading client inquiries...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-2">
            <Mail className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">No inquiries match the current filter.</p>
            <p className="text-[11px] text-slate-400">
              When prospective students or parents submit a query on the website, it will be listed here immediately.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMessages.map((m) => {
              const cleanPhone = m.phone.replace(/\D/g, '');
              const waNumber = cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '');
              const waUrl = `https://wa.me/${waNumber}?text=Assalam-o-Alaikum%20${encodeURIComponent(m.name)},%20we%20received%20your%20inquiry%20regarding%20Bright%20Future%20Coaching%20Academy%20Sadiqabad.`;

              return (
                <div
                  key={m.id}
                  className={`p-5 sm:p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-5 transition ${
                    m.status === 'new' ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-2.5 flex-1 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {m.name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : m.status === 'read'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-800 border border-rose-300 font-black'
                        }`}
                      >
                        {m.status}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        {new Date(m.submittedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-slate-600">
                      <span className="flex items-center gap-1 font-mono font-bold text-amber-300 bg-[#0f2042] px-2 py-0.5 rounded-md border border-blue-900/50">
                        <Phone className="w-3.5 h-3.5" />
                        {m.phone}
                      </span>
                      {m.email && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                          {m.email}
                        </span>
                      )}
                      {m.subject && (
                        <span className="font-semibold text-slate-800">
                          Subject: {m.subject}
                        </span>
                      )}
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs text-slate-800 leading-relaxed text-xs sm:text-sm">
                      {m.message}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        title="Open WhatsApp chat with client"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Reply
                      </a>
                      <a
                        href={`tel:${m.phone}`}
                        className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        title="Direct Phone Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.status !== 'resolved' && (
                        <button
                          onClick={() => m.id && handleStatus(m.id, 'resolved')}
                          className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Resolved
                        </button>
                      )}
                      {m.status === 'new' && (
                        <button
                          onClick={() => m.id && handleStatus(m.id, 'read')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => setMsgToDelete(m)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* In-app delete confirmation modal */}
      {msgToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-800 text-lg">Delete Contact Inquiry?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete message from{' '}
                <strong className="text-slate-700">{msgToDelete.name}</strong> ({msgToDelete.phone})?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setMsgToDelete(null)}
                disabled={deletingMsg}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteContact}
                disabled={deletingMsg}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition shadow-sm"
              >
                {deletingMsg ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
