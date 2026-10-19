import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Users,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { FeePayment, Student } from '../../types';
import { getAllFeePayments, recordFeePayment, deleteFeePayment } from '../../services/feeService';
import { getAllStudents } from '../../services/studentService';
import { PrintReceiptModal } from '../../components/common/PrintReceiptModal';
import { useAcademy } from '../../context/AcademyContext';

export const FeeManager: React.FC = () => {
  const { settings } = useAcademy();
  const [activeTab, setActiveTab] = useState<'payments' | 'pending'>('payments');
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');

  // New Payment Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState(3500);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [feeMonth, setFeeMonth] = useState('October 2026');
  const [paymentType, setPaymentType] = useState<FeePayment['paymentType']>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<FeePayment['paymentMethod']>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receivedBy, setReceivedBy] = useState('Accounts Office');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Print voucher modal
  const [voucherToPrint, setVoucherToPrint] = useState<FeePayment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pmts, stds] = await Promise.all([
        getAllFeePayments(),
        getAllStudents(),
      ]);
      setPayments(pmts || []);
      setStudents(stds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [paymentToDelete, setPaymentToDelete] = useState<FeePayment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState(false);

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    const target = paymentToDelete;
    setDeletingPayment(true);
    try {
      setPayments((prev) => prev.filter((p) => p.paymentId !== target.paymentId && p.receiptNumber !== target.receiptNumber));
      await deleteFeePayment(target.paymentId);
      setPaymentToDelete(null);
      setSuccessMsg(`✓ Receipt #${target.receiptNumber} successfully deleted.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingPayment(false);
    }
  };

  const handleStudentSelect = (sId: string) => {
    setSelectedStudentId(sId);
    const found = students.find((s) => s.studentId === sId);
    setSelectedStudent(found || null);
    if (found) {
      setAmount(found.balance > 0 ? found.balance : found.monthlyFee || 3500);
    }
  };

  const handleOpenCollectForStudent = (s: Student) => {
    setError(null);
    setSelectedStudentId(s.studentId);
    setSelectedStudent(s);
    setAmount(s.balance > 0 ? s.balance : s.monthlyFee || 3500);
    setShowModal(true);
  };

  const handleSendWhatsAppReminder = (s: Student) => {
    const rawPhone = (s.guardianPhone || s.phone || '').replace(/\D/g, '');
    const phone = rawPhone.startsWith('0') ? `92${rawPhone.slice(1)}` : rawPhone;
    const msg = encodeURIComponent(
      `Assalam-o-Alaikum!\nRespected Parent, this is an official fee reminder from ${settings.academyName} (Sadiqabad).\n\nStudent: ${s.fullName} (${s.studentId})\nClass: ${s.currentClass}\nPending Fee Due: PKR ${s.balance?.toLocaleString()}\n\nKindly clear the outstanding dues at your earliest convenience at the academy accounts office.\nContact: ${settings.phone}\nJazakAllah Khair!`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudent || !amount || amount <= 0) {
      setError('Please select a student and enter a valid payment amount.');
      return;
    }

    setSaving(true);
    try {
      const recorded = await recordFeePayment({
        studentId: selectedStudent.studentId,
        studentName: selectedStudent.fullName,
        classGrade: selectedStudent.currentClass,
        amount: Number(amount),
        feeMonth,
        paymentType,
        paymentMethod,
        referenceNumber: referenceNumber.trim(),
        discountApplied: Number(discountApplied),
        receivedBy: receivedBy.trim(),
        notes: notes.trim(),
        paidAt: new Date().toISOString(),
      });

      setShowModal(false);
      await loadData();
      // Prompt user to print voucher immediately
      setVoucherToPrint(recorded);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error recording payment.');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Receipt #', 'Student ID', 'Student Name', 'Class', 'Fee Month', 'Amount (PKR)', 'Type', 'Method', 'Reference', 'Date'];
    const rows = payments.map((p) => [
      p.receiptNumber,
      p.studentId,
      `"${p.studentName.replace(/"/g, '""')}"`,
      p.classGrade,
      p.feeMonth,
      p.amount,
      p.paymentType,
      p.paymentMethod,
      p.referenceNumber || '',
      new Date(p.paidAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.studentId.toLowerCase().includes(search.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(search.toLowerCase());

    const matchesMonth = filterMonth === 'All' || p.feeMonth.includes(filterMonth);
    return matchesSearch && matchesMonth;
  });

  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalPending = students.reduce((acc, s) => acc + (s.balance || 0), 0);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Finance & Accounts
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Fee Management & Receipts
          </h1>
          <p className="text-xs text-slate-500">
            Issue official tri-copy payment vouchers, track student balances, and generate financial reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setError(null);
              setShowModal(true);
            }}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Fee Payment
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block uppercase">Total Revenue Collected</span>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            PKR {totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{payments.length} Validated Vouchers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block uppercase">Total Pending Balance</span>
          <div className="text-2xl font-black font-mono text-rose-700 mt-1">
            PKR {totalPending.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across {students.filter(s => s.balance > 0).length} Students</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block uppercase">Payment Methods</span>
          <div className="text-xs font-medium text-slate-700 mt-2 space-y-1">
            <div>• Cash Counter at Sadiqabad Reception</div>
            <div>• JazzCash / EasyPaisa / Online Bank Transfer</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-[#0f2042] text-amber-300 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Payment Records & Vouchers ({payments.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>Student Pending Fees Register ({students.filter((s) => (s.balance || 0) > 0).length}) — PKR {totalPending.toLocaleString()}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'payments'
                ? "Search by student name, student ID, or receipt number (e.g. REC-)..."
                : "Search pending students by name, father name, or student ID..."
            }
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Tab 1: Fee Payments History Table */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Student Name & Pending Status</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Print Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading payment records...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No payment records found. Record a fee voucher above.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const matchedStudent = students.find((s) => s.studentId === p.studentId);
                    const pendingFee = matchedStudent ? (matchedStudent.balance || 0) : 0;
                    return (
                      <tr key={p.paymentId} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-slate-900">{p.studentName}</span>
                            {pendingFee > 0 ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>Pending: PKR {pendingFee.toLocaleString()}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                                Cleared
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">{p.studentId}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{p.classGrade}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{p.feeMonth}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-sm">
                          PKR {p.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="uppercase font-semibold text-[10px]">{p.paymentMethod}</div>
                          {p.referenceNumber && (
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                              {p.referenceNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(p.paidAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setVoucherToPrint(p)}
                              className="p-1.5 bg-[#0f2042] hover:bg-[#172554] text-amber-300 border border-blue-900/50 rounded-lg transition cursor-pointer"
                              title="Print Official Tri-Copy Voucher"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentToDelete(p)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Payment Voucher"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Dedicated Student Pending Fees Register */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-rose-50/70 border-b border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-rose-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Student Pending Fees Register (طلباء کی واجب الادا فیس رجسٹر)</span>
              </h3>
              <p className="text-xs text-rose-700">
                Detailed view of every student's outstanding fee with instant fee collection and WhatsApp reminder.
              </p>
            </div>
            <div className="text-xs font-bold font-mono text-rose-800 bg-white px-3 py-1.5 rounded-xl border border-rose-200">
              Total Dues: PKR {totalPending.toLocaleString()}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Full Name & Pending Due</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4">Monthly Fee</th>
                  <th className="py-3 px-4">Pending Due (واجب الادا)</th>
                  <th className="py-3 px-4 text-right">Instant Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const filteredPending = students
                    .filter((s) => (s.balance || 0) > 0)
                    .filter(
                      (s) =>
                        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        s.studentId.toLowerCase().includes(search.toLowerCase()) ||
                        s.fatherName.toLowerCase().includes(search.toLowerCase()) ||
                        s.phone.includes(search)
                    );

                  if (filteredPending.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          {search ? 'No students matching search criteria.' : '🎉 All student fees are cleared! Zero pending dues.'}
                        </td>
                      </tr>
                    );
                  }

                  return filteredPending.map((s) => (
                    <tr key={s.studentId} className="hover:bg-rose-50/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">
                        {s.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{s.fullName}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Pending: PKR {s.balance?.toLocaleString()}</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">S/D/O {s.fatherName}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {s.currentClass}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{s.guardianPhone || s.phone}</div>
                        <div className="text-[10px] text-slate-400">P: {s.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        PKR {s.monthlyFee?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sm text-rose-700">
                        PKR {s.balance?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenCollectForStudent(s)}
                            className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                            title="Collect Fee & Issue Voucher"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Collect Fee</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppReminder(s)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                            title="Send WhatsApp Fee Reminder"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Fee Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-bold text-lg text-slate-900">
                Record Student Fee Payment
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              {/* Select Student */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Enrolled Student *
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((st) => (
                    <option key={st.studentId} value={st.studentId}>
                      {st.fullName} ({st.studentId}) — Class: {st.currentClass} {st.balance > 0 ? `| ⚠️ Pending Due: PKR ${st.balance.toLocaleString()}` : '| ✅ All Paid'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="p-3 bg-gradient-to-r from-[#070f1e] to-[#0f2042] border border-blue-900/60 rounded-xl space-y-1 text-white shadow-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Student Name:</span>
                    <strong className="text-amber-300">{selectedStudent.fullName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Enrolled Class:</span>
                    <strong className="text-white">{selectedStudent.currentClass}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Monthly Tuition:</span>
                    <strong className="font-mono text-amber-300">PKR {selectedStudent.monthlyFee}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Current Outstanding Balance:</span>
                    <strong className="font-mono text-rose-300">PKR {selectedStudent.balance}</strong>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fee Month / Session *</label>
                  <input
                    type="text"
                    required
                    value={feeMonth}
                    onChange={(e) => setFeeMonth(e.target.value)}
                    placeholder="e.g. October 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Category</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="monthly">Monthly Tuition Fee</option>
                    <option value="admission">Admission Registration Fee</option>
                    <option value="exam">Board Mock Exam Fee</option>
                    <option value="annual">Annual Stationery / Test Series</option>
                    <option value="other">Other / Special Session</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Paid (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Concession Applied (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={discountApplied}
                    onChange={(e) => setDiscountApplied(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="cash">Cash (Counter)</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference / Trx ID</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. TID-987654321 / Bank Slip #"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Received By</label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    placeholder="Cashier or Accounts Officer Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white rounded-xl font-bold"
                >
                  {saving ? 'Recording Voucher...' : 'Confirm & Generate Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Voucher Modal */}
      {voucherToPrint && (
        <PrintReceiptModal
          payment={voucherToPrint}
          settings={settings}
          onClose={() => setVoucherToPrint(null)}
        />
      )}

      {/* In-App Delete Payment Confirmation Modal */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Fee Voucher?</h3>
                <p className="text-xs text-slate-500">Remove payment receipt #{paymentToDelete.receiptNumber}</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              Are you sure you want to delete payment of <strong>PKR {paymentToDelete.amount.toLocaleString()}</strong> for{' '}
              <strong>{paymentToDelete.studentName}</strong> ({paymentToDelete.feeMonth})? The student's balance will be automatically adjusted.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingPayment}
                onClick={confirmDeletePayment}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {deletingPayment ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
