import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { FeePayment, AcademySettings } from '../../types';

interface PrintReceiptModalProps {
  payment: FeePayment | null;
  settings: AcademySettings;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  payment,
  settings,
  onClose,
}) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const renderVoucherCopy = (copyTitle: string) => (
    <div className="border-2 border-slate-700 p-4 rounded-lg bg-white text-slate-900 text-xs flex-1 flex flex-col justify-between min-h-[360px]">
      <div>
        {/* Header */}
        <div className="text-center border-b pb-2 mb-3">
          {settings.logoUrl && (
            <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center">
              <img
                src={settings.logoUrl}
                alt={settings.academyName}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="font-serif font-black text-sm uppercase tracking-tight text-blue-900">
            {settings.academyName}
          </div>
          <div className="text-[10px] text-slate-600">
            {settings.address}, {settings.city} • Ph: {settings.phone}
          </div>
          <div className="inline-block bg-slate-800 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm mt-1">
            FEE VOUCHER — {copyTitle}
          </div>
        </div>

        {/* Voucher Meta */}
        <div className="grid grid-cols-2 gap-1 mb-2 bg-slate-50 p-1.5 rounded border border-slate-200 text-[11px]">
          <div>
            <span className="text-slate-500">Receipt No:</span>{' '}
            <strong className="font-mono">{payment.receiptNumber}</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-500">Date:</span>{' '}
            <strong>{new Date(payment.paidAt).toLocaleDateString()}</strong>
          </div>
        </div>

        {/* Student Details */}
        <div className="space-y-1.5 mb-3 text-[11px]">
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
            <span className="text-slate-600">Student ID:</span>
            <span className="font-bold font-mono">{payment.studentId}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
            <span className="text-slate-600">Student Name:</span>
            <span className="font-bold">{payment.studentName}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
            <span className="text-slate-600">Class / Program:</span>
            <span className="font-semibold">{payment.classGrade}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
            <span className="text-slate-600">Fee Month / Session:</span>
            <span className="font-semibold">{payment.feeMonth}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
            <span className="text-slate-600">Fee Category:</span>
            <span className="capitalize">{payment.paymentType} Fee</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
            <span className="text-slate-600">Payment Mode:</span>
            <span className="uppercase font-medium">
              {payment.paymentMethod.replace('_', ' ')}
            </span>
          </div>
          {payment.referenceNumber && (
            <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
              <span className="text-slate-600">Ref / Trx ID:</span>
              <span className="font-mono text-[10px]">{payment.referenceNumber}</span>
            </div>
          )}
        </div>

        {/* Amount Table */}
        <div className="bg-[#0f2042] text-white border border-blue-900/60 p-2.5 rounded-lg mb-2 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-amber-300">Total Amount Paid:</span>
            <span className="font-black text-sm text-amber-400 font-mono">
              PKR {payment.amount.toLocaleString()}
            </span>
          </div>
          {payment.discountApplied ? (
            <div className="text-[10px] text-emerald-700 mt-0.5">
              (Includes concession/discount: PKR {payment.discountApplied.toLocaleString()})
            </div>
          ) : null}
        </div>
      </div>

      {/* Signature & Stamp */}
      <div className="pt-3 border-t border-slate-200 flex justify-between items-end text-[10px]">
        <div>
          <div className="text-slate-400">Cashier / Staff:</div>
          <div className="font-semibold">{payment.receivedBy || 'Accounts Officer'}</div>
        </div>
        <div className="text-right">
          <div className="w-24 border-b border-slate-400 mb-0.5"></div>
          <div className="text-slate-500">Authorized Stamp</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative animate-in fade-in zoom-in-95">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Official Fee Receipt Voucher
              </h3>
              <p className="text-xs text-slate-500">
                Receipt #{payment.receiptNumber} • {payment.studentName} ({payment.studentId})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Voucher
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Section with 3 copies (Student, Academy, Accounts) */}
        <div className="mt-4 print:m-0 print:p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3">
            {renderVoucherCopy('Student Copy')}
            {renderVoucherCopy('Academy Copy')}
            {renderVoucherCopy('Accounts / Bank Copy')}
          </div>
          <div className="text-[10px] text-slate-400 text-center mt-3 print:mt-1">
            * This is a system-generated official fee voucher from {settings.academyName}, Sadiqabad. Tuition fees once paid are non-refundable.
          </div>
        </div>
      </div>
    </div>
  );
};
