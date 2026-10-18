import React, { useState, useEffect } from 'react';
import {
  Bot,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Plus,
  Trash2,
  RotateCcw,
  Send,
  Eye,
  Settings,
  ShieldAlert,
  Zap,
  Info
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import { updateAcademySettings, DEFAULT_ACADEMY_SETTINGS } from '../../services/academyService';
import { ChatbotSettings } from '../../types';
import { askAcademyAssistant, ChatMessage } from '../../services/aiChatService';

export const ChatbotSettingsManager: React.FC = () => {
  const { settings, refreshSettings } = useAcademy();

  const currentBotSettings: ChatbotSettings = settings.chatbotSettings || {
    enabled: true,
    botName: 'Bright Future AI Counselor',
    botTagline: '24/7 Virtual Admissions Desk',
    welcomeMessage: 'Assalam-o-Alaikum! Welcome to Bright Future Coaching Academy (Sadiqabad). How can I assist you with admissions, fees, class schedules, or test sessions today?',
    systemPrompt: 'You are the official 24/7 Virtual Counselor for Bright Future Coaching Academy located in Sadiqabad, District Rahim Yar Khan, Punjab. You guide students and parents about admissions for Class 9, 10, 11 (F.Sc Pre-Med, Pre-Engg, ICS), 12, fee concessions, timings, and campus facilities. Always answer politely in English, Urdu, or Roman Urdu depending on the user query. Never disclose administrative passwords or confidential keys.',
    tone: 'islamic_courteous',
    quickQuestions: [
      'Admissions 2026 Process',
      'Monthly Fee Structure',
      'Class 9 & 10 Batches',
      'F.Sc (Pre-Med & Pre-Engg)',
      'Campus Location & Timings',
      'Scholarships & Concessions'
    ],
    customKnowledge: 'Campus is located near Model Town, Main Kacha Sadiqabad Road. Morning shift for girls starts at 8:00 AM, Evening shift for boys starts at 3:30 PM. Weekly Sunday grand test sessions are conducted for board preparation.',
    autoOpenDelaySeconds: 0
  };

  const [enabled, setEnabled] = useState(currentBotSettings.enabled ?? true);
  const [botName, setBotName] = useState(currentBotSettings.botName || 'Bright Future AI Counselor');
  const [botTagline, setBotTagline] = useState(currentBotSettings.botTagline || '24/7 Virtual Admissions Desk');
  const [welcomeMessage, setWelcomeMessage] = useState(currentBotSettings.welcomeMessage || '');
  const [systemPrompt, setSystemPrompt] = useState(currentBotSettings.systemPrompt || '');
  const [tone, setTone] = useState<ChatbotSettings['tone']>(currentBotSettings.tone || 'islamic_courteous');
  const [quickQuestions, setQuickQuestions] = useState<string[]>(currentBotSettings.quickQuestions || []);
  const [newQuestion, setNewQuestion] = useState('');
  const [customKnowledge, setCustomKnowledge] = useState(currentBotSettings.customKnowledge || '');
  const [autoOpenDelaySeconds, setAutoOpenDelaySeconds] = useState(currentBotSettings.autoOpenDelaySeconds || 0);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Test Preview State
  const [testMessages, setTestMessages] = useState<ChatMessage[]>([]);
  const [testInput, setTestInput] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    // Initialize preview welcome message
    setTestMessages([
      {
        id: 'preview-welcome',
        sender: 'assistant',
        text: welcomeMessage || 'Assalam-o-Alaikum! How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [welcomeMessage]);

  const handleAddQuickQuestion = () => {
    if (newQuestion.trim()) {
      setQuickQuestions([...quickQuestions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuickQuestion = (idx: number) => {
    setQuickQuestions(quickQuestions.filter((_, i) => i !== idx));
  };

  const handleResetDefaults = () => {
    const d = DEFAULT_ACADEMY_SETTINGS.chatbotSettings;
    if (d) {
      setEnabled(d.enabled);
      setBotName(d.botName);
      setBotTagline(d.botTagline || '');
      setWelcomeMessage(d.welcomeMessage);
      setSystemPrompt(d.systemPrompt);
      setTone(d.tone);
      setQuickQuestions(d.quickQuestions);
      setCustomKnowledge(d.customKnowledge || '');
      setAutoOpenDelaySeconds(d.autoOpenDelaySeconds);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const updatedBotConfig: ChatbotSettings = {
        enabled,
        botName: botName.trim(),
        botTagline: botTagline.trim(),
        welcomeMessage: welcomeMessage.trim(),
        systemPrompt: systemPrompt.trim(),
        tone,
        quickQuestions: quickQuestions.filter((q) => q.trim().length > 0),
        customKnowledge: customKnowledge.trim(),
        autoOpenDelaySeconds: Number(autoOpenDelaySeconds) || 0,
      };

      await updateAcademySettings({
        chatbotSettings: updatedBotConfig,
      });

      await refreshSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating chatbot settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async (msgToSend?: string) => {
    const text = (msgToSend || testInput).trim();
    if (!text || testLoading) return;

    const userMsg: ChatMessage = {
      id: `test-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...testMessages, userMsg];
    setTestMessages(newHistory);
    setTestInput('');
    setTestLoading(true);

    try {
      // Mock or call assistant with updated temporary settings
      const tempSettings = {
        ...settings,
        chatbotSettings: {
          enabled,
          botName,
          botTagline,
          welcomeMessage,
          systemPrompt,
          tone,
          quickQuestions,
          customKnowledge,
          autoOpenDelaySeconds,
        },
      };

      const res = await askAcademyAssistant(
        text,
        { settings: tempSettings, courses: [] },
        newHistory
      );

      setTestMessages((prev) => [
        ...prev,
        {
          id: `test-asst-${Date.now()}`,
          sender: 'assistant',
          text: res.text,
          thinking: res.thinking,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setTestMessages((prev) => [
        ...prev,
        {
          id: `test-err-${Date.now()}`,
          sender: 'assistant',
          text: `For live guidance, please contact reception at ${settings.phone}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              AI Assistant & Virtual Counselor
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
              enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {enabled ? 'Active on Public Website' : 'Chatbot Disabled'}
            </span>
          </div>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Chatbot Settings & Customization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize your virtual admissions bot name, welcome greeting, AI system prompt, quick questions, and custom knowledge.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2.5 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 border border-blue-900 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving ? 'Saving Settings...' : 'Save Chatbot Settings'}</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Chatbot settings successfully updated! Public visitors will immediately see these new settings.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form Column */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-7 space-y-6">
          {/* Section 1: Activation & Identity */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-700" />
              <span>Chatbot Identity & Visibility</span>
            </h3>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-900 block">
                  Enable Chatbot on Website
                </label>
                <p className="text-[11px] text-slate-500">
                  When enabled, visitors will see the floating chat counselor button on bottom-right.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                  Bot Display Name
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g. Bright Future AI Counselor"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                  Bot Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={botTagline}
                  onChange={(e) => setBotTagline(e.target.value)}
                  placeholder="e.g. 24/7 Virtual Admissions Desk"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                Conversation Tone & Style
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-xs font-medium"
              >
                <option value="islamic_courteous">Islamic & Courteous (Assalam-o-Alaikum, Respectful Urdu / English)</option>
                <option value="friendly">Friendly & Supportive (Encouraging tone for students)</option>
                <option value="academic">Academic & Professional (Formal institutional counselor)</option>
                <option value="direct">Concise & Direct (Brief, factual point-by-point answers)</option>
              </select>
            </div>
          </div>

          {/* Section 2: Welcome Greeting & Prompts */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-700" />
              <span>Welcome Message & AI Instructions</span>
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold uppercase text-[10px]">
                  Welcome Greeting Message
                </label>
                <span className="text-[10px] text-slate-400">First message displayed to users</span>
              </div>
              <textarea
                rows={3}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Write the welcome greeting in English, Urdu, or Roman Urdu..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-xs leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold uppercase text-[10px]">
                  System Prompt / Bot Behavioral Rules
                </label>
                <span className="text-[10px] text-slate-400">Guides how AI analyzes and answers queries</span>
              </div>
              <textarea
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Give instructions to the AI regarding how to guide students, what to emphasize, tone of voice, etc."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-xs leading-relaxed font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold uppercase text-[10px]">
                  Custom Knowledge Base / Special Notes
                </label>
                <span className="text-[10px] text-slate-400">Extra facts, timings, discount criteria, etc.</span>
              </div>
              <textarea
                rows={3}
                value={customKnowledge}
                onChange={(e) => setCustomKnowledge(e.target.value)}
                placeholder="Enter any special details you want the chatbot to know (e.g. 10% sibling discount, Sunday mock tests schedule, girls morning batch at 8 AM, etc.)"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Section 3: Quick Question Suggestion Buttons */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Quick Question Suggestion Chips ({quickQuestions.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400">Clickable buttons for instant answers</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddQuickQuestion();
                  }
                }}
                placeholder="e.g. What is the fee for Class 10th?"
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddQuickQuestion}
                className="px-4 py-2 bg-[#0f2042] text-amber-300 hover:bg-[#1a365d] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Chip</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {quickQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2 shadow-2xs"
                >
                  <span>{q}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuickQuestion(idx)}
                    className="text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 border border-blue-900 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saving ? 'Saving...' : 'Save All Chatbot Settings'}</span>
            </button>
          </div>
        </form>

        {/* Live Simulator Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
            <div className="bg-[#0f2042] text-white p-4 flex items-center justify-between border-b border-blue-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white leading-tight">
                    {botName || 'AI Counselor'}
                  </h4>
                  <p className="text-[10px] text-amber-300 font-medium">
                    {botTagline || 'Live Preview Simulator'}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-mono">
                Live Test
              </span>
            </div>

            {/* Chat Messages Simulator */}
            <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-50/70 text-xs">
              {testMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-[#0f2042] text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed text-[11px]">
                      {msg.text}
                    </div>
                    <div className={`text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              {testLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  <span>{botName} is thinking...</span>
                </div>
              )}
            </div>

            {/* Quick Chips in Preview */}
            {quickQuestions.length > 0 && (
              <div className="p-2.5 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar">
                {quickQuestions.slice(0, 4).map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendTestMessage(q)}
                    className="shrink-0 px-2.5 py-1 bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 text-[10px] rounded-lg font-medium transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Test Input */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendTestMessage();
                  }
                }}
                placeholder="Type a test question (e.g. fees, timings)..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleSendTestMessage()}
                disabled={testLoading || !testInput.trim()}
                className="p-2 bg-[#0f2042] text-amber-300 hover:bg-[#1a365d] disabled:bg-slate-300 rounded-xl transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Password & Security Guarantee</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your chatbot automatically protects all administrative credentials, database keys, and staff logins. Even if visitors ask about passwords, it will never disclose them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
