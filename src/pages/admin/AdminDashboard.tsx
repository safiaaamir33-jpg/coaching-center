import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  CheckSquare,
  Bot
} from 'lucide-react';
import {
  Student,
  Teacher,
  Course,
  AdmissionApplication,
  FeePayment,
  ContactMessage
} from '../../types';
import { getAllStudents } from '../../services/studentService';
import { getAllTeachersAdmin } from '../../services/teacherService';
import { getAllCourses } from '../../services/courseService';
import { getAllAdmissions } from '../../services/admissionService';
import { getAllFeePayments } from '../../services/feeService';
import { getAllContactMessages, updateContactStatus } from '../../services/contactService';
import { PrintReceiptModal } from '../../components/common/PrintReceiptModal';
import { useAcademy } from '../../context/AcademyContext';

export const AdminDashboard: React.FC = () => {
  const { settings } = useAcademy();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [st, tc, cr, ad, py, msgs] = await Promise.all([
        getAllStudents().catch(() => []),
        getAllTeachersAdmin().catch(() => []),
        getAllCourses().catch(() => []),
        getAllAdmissions().catch(() => []),
        getAllFeePayments().catch(() => []),
        getAllContactMessages().catch(() => []),
      ]);
      setStudents(st || []);
      setTeachers(tc || []);
      setCourses(cr || []);
      setAdmissions(ad || []);
      setPayments(py || []);
      setContactMessages(msgs || []);
    } catch (err) {
      console.error('Error loading dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  }

  // Compute live financial and academic metrics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'active').length;
  const totalTeachers = teachers.length;
  const activeCourses = courses.filter((c) => c.isPublished).length;
  const pendingAdmissions = admissions.filter((a) => a.status === 'pending').length;
  const newMessages = contactMessages.filter((m) => m.status === 'new').length;
  const totalPendingBalance = students.reduce((acc, s) => acc + (s.balance || 0), 0);
  const totalFeesCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateContactStatus(id, 'read');
      setContactMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'read' } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Administrative Control Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
            Academy Management Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operations for {settings.academyName} • Sadiqabad Campus
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/attendance"
            className="px-3 py-2 rounded-xl bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 border border-blue-900/60 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-amber-400" />
            + Add Attendance
          </Link>
          <Link
            to="/admin/students?action=new"
            className="px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
          <Link
            to="/admin/cms"
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            + Add Poster / Notice
          </Link>
          <Link
            to="/admin/chatbot"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition cursor-pointer border border-slate-700"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            Chatbot Settings
          </Link>
          <Link
            to="/admin/fees"
            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            Collect Fee
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {/* Enrolled Students */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Students</span>
            <div className="w-8 h-8 rounded-lg bg-[#0f2042] text-amber-300 border border-blue-900/40 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {loading ? '...' : totalStudents}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            {activeStudents} Active in Batches
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Teachers</span>
            <div className="w-8 h-8 rounded-lg bg-[#0f2042] text-amber-300 border border-blue-900/40 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {loading ? '...' : totalTeachers}
          </div>
          <div className="text-[11px] text-slate-500">Board Specialists</div>
        </div>

        {/* Active Courses */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Courses</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {loading ? '...' : activeCourses}
          </div>
          <div className="text-[11px] text-slate-500">Matric & Inter</div>
        </div>

        {/* New Client Inquiries (Prominent Alert) */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-2xl shadow-xs border border-rose-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1">
              {newMessages > 0 && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />}
              Client Messages
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            {loading ? '...' : newMessages}
          </div>
          <Link
            to="/admin/messages"
            className="text-[11px] text-rose-700 hover:underline font-bold block"
          >
            {newMessages > 0 ? `Reply to ${newMessages} New Messages →` : 'All Inquiries →'}
          </Link>
        </div>

        {/* Pending Admissions */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Admissions</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-purple-700">
            {loading ? '...' : pendingAdmissions}
          </div>
          <Link
            to="/admin/admissions"
            className="text-[11px] text-purple-600 hover:underline font-semibold block"
          >
            Review Pending ({pendingAdmissions}) →
          </Link>
        </div>

        {/* Fees Collected */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Fees Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-emerald-700 truncate">
            {loading ? '...' : `PKR ${totalFeesCollected.toLocaleString()}`}
          </div>
          <div className="text-[11px] text-slate-500">{payments.length} Vouchers</div>
        </div>

        {/* Pending Fee Balance */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Defaulter Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-amber-700 truncate">
            {loading ? '...' : `PKR ${totalPendingBalance.toLocaleString()}`}
          </div>
          <Link
            to="/admin/fees"
            className="text-[11px] text-amber-600 hover:underline font-semibold block"
          >
            Track Defaulters →
          </Link>
        </div>
      </div>

      {/* Dedicated Section: Client Messages & Inquiries (NEW & REAL-TIME) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-700" />
              Direct Client Inquiries & Messages (کلائنٹ پیغامات)
              {newMessages > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 animate-pulse">
                  {newMessages} New
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Messages received from prospective students and parents via the website & online contact desk
            </p>
          </div>
          <Link
            to="/admin/messages"
            className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1"
          >
            Open Full Inbox ({contactMessages.length}) →
          </Link>
        </div>

        {contactMessages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No inquiries received yet. When visitors send a message or inquiry, it will appear here instantly!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactMessages.slice(0, 6).map((msg) => {
              const cleanPhone = msg.phone.replace(/\D/g, '');
              const waUrl = `https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '')}?text=Assalam-o-Alaikum%20${encodeURIComponent(msg.name)},%20we%20received%20your%20message%20at%20Bright%20Future%20Coaching%20Academy%20Sadiqabad.`;
              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                    msg.status === 'new'
                      ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {msg.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          msg.status === 'new'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-blue-800 font-medium">
                      {msg.subject || 'Admission Inquiry'}
                    </div>

                    <p className="text-xs text-slate-700 line-clamp-3 bg-white p-2.5 rounded-xl border border-slate-200/60 leading-relaxed italic">
                      "{msg.message}"
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.submittedAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Quick Action Buttons for Admin to respond */}
                  <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${msg.phone}`}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold flex items-center gap-1 transition"
                        title="Call Phone"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    </div>

                    {msg.status === 'new' && (
                      <button
                        onClick={() => handleMarkAsRead(msg.id!)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Recent Admissions & Recent Fee Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Admissions */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Recent Admission Applications
              </h3>
              <p className="text-xs text-slate-500">Online requests submitted by parents & students</p>
            </div>
            <Link
              to="/admin/admissions"
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              View All ({admissions.length})
            </Link>
          </div>

          {admissions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No admission applications received yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {admissions.slice(0, 5).map((app) => (
                <div key={app.applicationRef} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {app.fullName}
                    </div>
                    <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-blue-700 font-semibold">{app.applicationRef}</span>
                      <span>•</span>
                      <span>{app.requestedClass}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>
                    <Link
                      to={`/admin/admissions?highlight=${app.applicationRef}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Fee Payments & Receipts */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Recent Fee Payments
              </h3>
              <p className="text-xs text-slate-500">Latest vouchers collected</p>
            </div>
            <Link
              to="/admin/fees"
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              View All ({payments.length})
            </Link>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No fee payments recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {payments.slice(0, 5).map((pmt) => (
                <div key={pmt.paymentId} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {pmt.studentName}
                    </div>
                    <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-slate-700">{pmt.studentId}</span>
                      <span>•</span>
                      <span>{pmt.feeMonth}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold font-mono text-emerald-700 text-sm">
                        PKR {pmt.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase">
                        {pmt.paymentMethod}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedReceipt(pmt)}
                      className="p-1.5 text-[#0f2042] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Print Voucher"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Print Receipt Modal */}
      {selectedReceipt && (
        <PrintReceiptModal
          payment={selectedReceipt}
          settings={settings}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
