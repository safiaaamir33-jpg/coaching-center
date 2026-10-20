import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Brain,
  ChevronDown,
  ShieldCheck,
  Phone,
  MessageCircle,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import { Course } from '../../types';
import { getPublishedCourses } from '../../services/courseService';
import { askAcademyAssistant, ChatMessage } from '../../services/aiChatService';
import { submitContactMessage } from '../../services/contactService';

export const Chatbot: React.FC = () => {
  const { settings } = useAcademy();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'message'>('chat');
  const [courses, setCourses] = useState<Course[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Direct Message Form State
  const [msgName, setMsgName] = useState('');
  const [msgPhone, setMsgPhone] = useState('');
  const [msgSubject, setMsgSubject] = useState('Admission Inquiry');
  const [msgBody, setMsgBody] = useState('');
  const [msgSubmitting, setMsgSubmitting] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);

  const botConfig = settings.chatbotSettings;
  const isBotEnabled = botConfig?.enabled ?? true;

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const welcome = botConfig?.welcomeMessage ||
      `Assalam-o-Alaikum & Welcome to **${settings.academyName}** (Sadiqabad)! 🎓✨\n\nI am your 24/7 Virtual Counselor. I can instantly answer your questions in **English, Urdu (اردو), or Roman Urdu** about:\n\n• **Class Admissions & Batches** (Classes 1–12, Matric, F.Sc, ICS)\n• **Tuition Fees & Special Concessions**\n• **Class Timings & Evening Shifts**\n• **Weekly Test Sessions & Faculty**\n\nHow can I help you today? You can also click **"Leave a Message"** above to send a direct inquiry to the Principal/Admin!`;

    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [botConfig?.welcomeMessage, settings.academyName]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPublishedCourses().then(setCourses).catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askAcademyAssistant(
        q,
        { settings, courses },
        messages
      );

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        thinking: response.thinking,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text: `Aap ki rehnumai ke liye humara campus desk har waqt hazir hai! You can also WhatsApp our reception in Sadiqabad directly at **${settings.whatsappNumber}** or call **${settings.phone}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgName.trim() || !msgPhone.trim() || !msgBody.trim()) {
      setMsgError('Please enter your name, phone number, and message.');
      return;
    }

    setMsgSubmitting(true);
    setMsgError(null);
    try {
      await submitContactMessage({
        name: msgName.trim(),
        phone: msgPhone.trim(),
        subject: `[Chatbot Inquiry] ${msgSubject}`,
        message: msgBody.trim(),
      });
      setMsgSuccess(true);

      // Also add an automated confirmation message to chat
      const confirmMsg: ChatMessage = {
        id: `asst-confirm-${Date.now()}`,
        sender: 'assistant',
        text: `✅ **Message Received!** Shukriya ${msgName.trim()}! Aap ka message **${settings.academyName}** کے دفتر کو پہنچ چکا ہے۔ ہمارے نمائندے آپ سے فون یا واٹس ایپ (${msgPhone.trim()}) پر جلد رابطہ کریں گے۔`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, confirmMsg]);

      // Reset form
      setMsgName('');
      setMsgPhone('');
      setMsgBody('');
      setTimeout(() => {
        setMsgSuccess(false);
        setActiveTab('chat');
      }, 2000);
    } catch (err: unknown) {
      console.error('Error sending direct message:', err);
      setMsgError(err instanceof Error ? err.message : 'Error sending message. Please try again.');
    } finally {
      setMsgSubmitting(false);
    }
  };

  const defaultQuestions = [
    'Matric & F.Sc Fees?',
    'داخلہ کیسے لیں؟ (How to apply)',
    'Classes & Shifts Timings',
    'Campus Location (Sadiqabad)',
    'Discount & Concessions',
    'Faculty & Teachers',
  ];

  const quickQuestions = botConfig?.quickQuestions?.length
    ? botConfig.quickQuestions
    : defaultQuestions;

  if (!isBotEnabled) {
    return null;
  }

  const botDisplayName = botConfig?.botName || `${settings.academyName} Counselor`;
  const botDisplayTagline = botConfig?.botTagline || 'Interactive AI Counselor • Sadiqabad';

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-50">
      {/* Floating Toggle Button with Glowing Badge */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 sm:gap-3 px-3.5 py-3 sm:px-5 sm:py-4 rounded-full bg-gradient-to-r from-[#070f1e] via-[#0f2042] to-[#172554] hover:from-[#0b172a] hover:to-[#0f2042] text-white shadow-2xl shadow-[#070f1e]/50 transition transform hover:scale-105 active:scale-95 cursor-pointer border border-blue-900/60 group"
          aria-label="Open Chat Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 group-hover:rotate-6 transition transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#070f1e] animate-pulse"></span>
          </div>
          <div className="text-left">
            <div className="font-bold text-xs leading-none flex items-center gap-1">
              <span>{botDisplayName}</span>
              <span className="sm:hidden text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-mono">Live</span>
            </div>
            <div className="text-[10px] text-blue-200 mt-0.5 hidden sm:block">Online • English & Roman Urdu</div>
          </div>
        </button>
      ) : (
        /* Chat Window with Luxury Aesthetic - fully mobile responsive */
        <div className="w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[420px] h-[550px] max-h-[78vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#070f1e] via-[#0f2042] to-[#172554] text-white p-4 flex items-center justify-between border-b border-blue-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#070f1e] to-[#0f2042] border border-blue-900/60 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5 font-serif">
                  {botDisplayName}
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full border border-emerald-400/40">
                    Live
                  </span>
                </h4>
                <div className="text-[10px] text-blue-300 flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{botDisplayTagline}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-blue-200 hover:text-white rounded-xl transition hover:bg-white/10 cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector: Live AI Chat vs Direct Message to Admin */}
          <div className="flex p-1 bg-slate-100 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-blue-700" />
              Live AI Counselor
            </button>
            <button
              onClick={() => setActiveTab('message')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'message'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              Direct Message to Office (پیغام بھیجیں)
            </button>
          </div>

          {/* Content Area */}
          {activeTab === 'chat' ? (
            <>
              {/* Quick Filter Questions */}
              <div className="bg-slate-50 border-b border-slate-200/80 p-2.5 flex gap-1.5 overflow-x-auto no-scrollbar">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={loading}
                    className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] bg-white text-slate-700 hover:text-amber-300 hover:bg-[#0f2042] border border-slate-200 font-medium transition cursor-pointer shrink-0 disabled:opacity-50 shadow-xs active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-slate-50 to-slate-100/60 text-sm">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${
                      m.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {m.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#070f1e] to-[#0f2042] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs border border-blue-900/60">
                        <Bot className="w-4 h-4 text-amber-300" />
                      </div>
                    )}
                    <div className={`max-w-[84%] space-y-1`}>
                      {m.thinking && (
                        <div className="text-[10px] text-amber-300 bg-[#0f2042] border border-blue-900/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-xs">
                          <Brain className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-pulse" />
                          <span className="italic leading-tight">{m.thinking}</span>
                        </div>
                      )}
                      <div
                        className={`p-3.5 rounded-2xl whitespace-pre-line leading-relaxed text-xs sm:text-sm ${
                          m.sender === 'user'
                            ? 'bg-[#0f2042] text-white rounded-tr-none shadow-md border border-blue-900/60'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                      <div
                        className={`text-[9px] text-slate-400 px-1 ${
                          m.sender === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {m.timestamp}
                      </div>
                    </div>
                    {m.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                        <User className="w-4 h-4 text-blue-200" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 items-center text-xs text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs w-fit">
                    <Brain className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="font-medium">Formulating instant comprehensive answer...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer Input */}
              <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Poochhein: fees, admission, timings..."
                    className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shrink-0 shadow-md"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Credentials & student data strictly protected
                  </span>
                  <span>Sadiqabad Campus</span>
                </div>
              </div>
            </>
          ) : (
            /* Direct Message to Office Form */
            <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  Send Direct Message to Academy Office
                </h4>
                <p className="text-[11px] text-slate-500">
                  Leave your inquiry here. The administration will receive it immediately and reply to you on WhatsApp / Phone.
                </p>
              </div>

              {msgSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Message sent successfully! Our team will contact you shortly.</span>
                </div>
              )}

              {msgError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{msgError}</span>
                </div>
              )}

              <form onSubmit={handleDirectMessageSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Student / Parent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={msgName}
                    onChange={(e) => setMsgName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    WhatsApp or Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={msgPhone}
                    onChange={(e) => setMsgPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Class / Subject of Interest
                  </label>
                  <select
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="9th Class Science">9th Class Science Coaching</option>
                    <option value="10th Class Matric">10th Class Matric Coaching</option>
                    <option value="F.Sc Pre-Medical">F.Sc Pre-Medical</option>
                    <option value="F.Sc Pre-Engineering">F.Sc Pre-Engineering</option>
                    <option value="ICS Computer Science">ICS Computer Science</option>
                    <option value="Junior Tuition (1-8)">Junior Classes (1–8)</option>
                    <option value="Spoken English">Spoken English Session</option>
                    <option value="Fee Concession Inquiry">Fee Discount / Concession</option>
                    <option value="General Question">Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Your Message / Question *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    placeholder="Apna sawal yahan likhein (fees, timings, admission ke baray me)..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={msgSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {msgSubmitting ? 'Sending to Office...' : 'Send Message to Principal'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="text-xs text-blue-700 font-semibold hover:underline"
                >
                  ← Return to Live AI Chat
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
