
import React from 'react';
import { DownloadIcon } from './icons';

declare const html2canvas: any;
declare const jspdf: any;

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherData: {
    customerName: string;
    amount: number;
    code: string;
    issueDate: string;
    expiryDate: string;
  } | null;
  companyName: string;
  companyLogo: string;
}

const VoucherModal: React.FC<VoucherModalProps> = ({ isOpen, onClose, voucherData, companyName, companyLogo }) => {
  if (!isOpen || !voucherData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const { jsPDF } = jspdf;
    const input = document.getElementById('voucher-print-area');
    if (input && voucherData) {
        html2canvas(input, { scale: 2, useCORS: true }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a5');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgWidth = pdfWidth - 20;
            const imgHeight = imgWidth / ratio;
            
            const x = 10;
            const y = 10;
            
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`voucher-${voucherData.code}.pdf`);
        });
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #voucher-print-area, #voucher-print-area * {
            visibility: visible;
          }
          #voucher-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
          <div id="voucher-print-area" className="p-8 border-dashed border-4 border-gray-300 bg-gray-50 text-right">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                {companyLogo && <img src={companyLogo} alt="Company Logo" className="h-16 max-w-[150px] object-contain" />}
                <h3 className="text-xl font-bold text-text-secondary">{companyName}</h3>
            </div>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-primary">قسيمة خصم</h2>
              <p className="text-text-secondary">Voucher</p>
            </div>
            <div className="space-y-4 text-lg">
              <p><span className="font-semibold ml-2">مقدمة إلى:</span> {voucherData.customerName}</p>
              <p className="text-2xl font-bold bg-secondary text-primary p-4 rounded-md text-center">
                خصم بقيمة <span className="font-mono">{voucherData.amount.toLocaleString('ar-EG')}</span> جنيه مصري
              </p>
              <p><span className="font-semibold ml-2">كود القسيمة:</span> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{voucherData.code}</span></p>
              <div className="flex justify-between text-sm text-text-secondary pt-4">
                <p><span className="font-semibold ml-2">تاريخ الإصدار:</span> {voucherData.issueDate}</p>
                <p><span className="font-semibold ml-2">تاريخ الانتهاء:</span> {voucherData.expiryDate}</p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t text-xs text-text-secondary text-center">
              <p>الشروط والأحكام: تستخدم هذه القسيمة لمرة واحدة فقط. لا يمكن استبدالها نقدًا. صالحة للاستخدام في جميع الفروع.</p>
            </div>
          </div>
          <div className="p-4 bg-gray-100 flex justify-end space-x-2 space-x-reverse no-print">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
              إغلاق
            </button>
            <button onClick={handleDownloadPdf} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
                <DownloadIcon className="w-5 h-5" />
                تنزيل PDF
            </button>
            <button onClick={handlePrint} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">
              طباعة
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VoucherModal;
