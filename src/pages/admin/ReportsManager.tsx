import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2
} from 'lucide-react';
import { Student, FeePayment, AdmissionApplication, TeacherSalary } from '../../types';
import { getAllStudents } from '../../services/studentService';
import { getAllFeePayments } from '../../services/feeService';
import { getAllAdmissions } from '../../services/admissionService';
import { getAllSalaryPayments } from '../../services/salaryService';
import { useAcademy } from '../../context/AcademyContext';

export const ReportsManager: React.FC = () => {
  const { settings } = useAcademy();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [salaries, setSalaries] = useState<TeacherSalary[]>([]);
  const [reportType, setReportType] = useState<'fees' | 'admissions' | 'salaries' | 'students'>('fees');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllStudents(),
      getAllFeePayments(),
      getAllAdmissions(),
      getAllSalaryPayments().catch(() => []),
    ]).then(([st, py, ad, sl]) => {
      setStudents(st || []);
      setPayments(py || []);
      setAdmissions(ad || []);
      setSalaries(sl || []);
      setLoading(false);
    });
  }, []);

  const totalFeeCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalSalariesPaid = salaries.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalStudentBalance = students.reduce((acc, s) => acc + (s.balance || 0), 0);

  const exportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (reportType === 'fees') {
      headers = ['Receipt Number', 'Student Name', 'Student ID', 'Class', 'Fee Month', 'Amount (PKR)', 'Method', 'Date'];
      rows = payments.map((p) => [
        p.receiptNumber,
        `"${p.studentName.replace(/"/g, '""')}"`,
        p.studentId,
        p.classGrade,
        p.feeMonth,
        p.amount,
        p.paymentMethod,
        new Date(p.paidAt).toLocaleDateString(),
      ]);
    } else if (reportType === 'admissions') {
      headers = ['Application Ref', 'Applicant Name', 'Father Name', 'Class', 'Contact', 'Status', 'Date'];
      rows = admissions.map((a) => [
        a.applicationRef,
        `"${a.fullName.replace(/"/g, '""')}"`,
        `"${a.fatherName.replace(/"/g, '""')}"`,
        a.requestedClass,
        a.phone,
        a.status,
        new Date(a.submittedAt).toLocaleDateString(),
      ]);
    } else if (reportType === 'salaries') {
      headers = ['Instructor Name', 'Month', 'Amount (PKR)', 'Payment Method', 'Reference', 'Date'];
      rows = salaries.map((s) => [
        `"${s.teacherName.replace(/"/g, '""')}"`,
        s.month,
        s.amount,
        s.paymentMethod,
        s.reference || '',
        new Date(s.paidAt).toLocaleDateString(),
      ]);
    } else {
      headers = ['Student ID', 'Full Name', 'Father Name', 'Class', 'Contact', 'Monthly Fee', 'Balance (PKR)', 'Status'];
      rows = students.map((s) => [
        s.studentId,
        `"${s.fullName.replace(/"/g, '""')}"`,
        `"${s.fatherName.replace(/"/g, '""')}"`,
        s.currentClass,
        s.phone,
        s.monthlyFee,
        s.balance,
        s.status,
      ]);
    }

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Executive Intelligence
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Reports & Financial Audit
          </h1>
          <p className="text-xs text-slate-500">
            Export verified fee ledgers, teacher salaries, enrollment ratios, and admission statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Gross Fee Collected</span>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            PKR {totalFeeCollected.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{payments.length} Payments</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Student Fees</span>
          <div className="text-2xl font-black font-mono text-rose-700 mt-1">
            PKR {totalStudentBalance.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Defaulter Balance</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Teacher Payroll Disbursed</span>
          <div className="text-2xl font-black font-mono text-blue-800 mt-1">
            PKR {totalSalariesPaid.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{salaries.length} Salary Vouchers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Net Academic Surplus</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            PKR {(totalFeeCollected - totalSalariesPaid).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Operational Margin</div>
        </div>
      </div>

      {/* Select Report View */}
      <div className="flex border-b border-slate-200 print:hidden">
        {[
          { id: 'fees', label: 'Fee Collection Ledger' },
          { id: 'admissions', label: 'Admissions Report' },
          { id: 'salaries', label: 'Teacher Salary Ledger' },
          { id: 'students', label: 'Student Enrollment Roll' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setReportType(t.id as any)}
            className={`py-3 px-5 font-bold text-xs uppercase tracking-wider border-b-2 transition cursor-pointer ${
              reportType === t.id
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Report Tables */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {reportType === 'fees' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Session Month</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.paymentId}>
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{p.receiptNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.studentName}</td>
                    <td className="py-3 px-4">{p.classGrade}</td>
                    <td className="py-3 px-4">{p.feeMonth}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      PKR {p.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px]">{p.paymentMethod}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'admissions' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Application Ref</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Father Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admissions.map((a) => (
                  <tr key={a.applicationRef}>
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{a.applicationRef}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{a.fullName}</td>
                    <td className="py-3 px-4">{a.fatherName}</td>
                    <td className="py-3 px-4 font-medium">{a.requestedClass}</td>
                    <td className="py-3 px-4 font-mono">{a.phone}</td>
                    <td className="py-3 px-4 uppercase font-bold text-[10px]">{a.status}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(a.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'salaries' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Instructor Name</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Amount Disbursed</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salaries.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 px-4 font-bold text-slate-900">{s.teacherName}</td>
                    <td className="py-3 px-4">{s.month}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      PKR {s.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px]">{s.paymentMethod.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-mono text-[10px]">{s.reference || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(s.paidAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'students' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Monthly Fee</th>
                  <th className="py-3 px-4">Pending Balance</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.studentId}>
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{st.studentId}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-900">{st.fullName}</span>
                        {st.balance > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            Pending: PKR {st.balance.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{st.currentClass}</td>
                    <td className="py-3 px-4 font-mono">{st.phone}</td>
                    <td className="py-3 px-4 font-mono font-semibold">PKR {st.monthlyFee?.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-700">
                      PKR {st.balance?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 uppercase font-bold text-[10px]">{st.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
