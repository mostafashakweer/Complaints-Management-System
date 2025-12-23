import React, { useState } from 'react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (mapping: { [key: string]: string }) => void;
  csvHeaders: string[];
}

const CUSTOMER_FIELDS = {
  id: 'كود العميل (للمطابقة والتحديث)',
  name: 'الاسم',
  phone: 'رقم الهاتف',
  email: 'البريد الإلكتروني',
  governorate: 'المحافظة',
  streetAddress: 'عنوان الشارع',
};

const TRANSACTION_FIELDS = {
  invoiceId: 'رقم الفاتورة',
  invoiceDate: 'تاريخ الفاتورة (YYYY-MM-DD)',
  invoiceDetails: 'تفاصيل الفاتورة',
  invoiceAmount: 'مبلغ الفاتورة',
};

const SUMMARY_FIELDS = {
  _oldTotalPurchases: 'إجمالي الإنفاق القديم',
  _oldPoints: 'النقاط القديمة',
};


const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose, onImport, csvHeaders }) => {
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});

  const handleMappingChange = (csvHeader: string, targetFieldKey: string) => {
    setMapping(prev => ({ ...prev, [csvHeader]: targetFieldKey }));
  };

  const handleImportClick = () => {
    const mappedValues = Object.values(mapping);
    if (!mappedValues.includes('id') && !mappedValues.includes('phone')) {
      alert('يرجى ربط عمود "كود العميل" أو "رقم الهاتف" على الأقل. يستخدم لمطابقة العملاء.');
      return;
    }
    onImport(mapping);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-2 text-text-primary">ربط أعمدة ملف CSV</h2>
        <p className="text-sm text-text-secondary mb-4">
            الرجاء مطابقة الأعمدة من ملفك مع الحقول في النظام. سيتم تحديث العملاء الحاليين أو إضافة جدد بناءً على رقم الهاتف.
        </p>
        
        <div className="max-h-96 overflow-y-auto pr-2">
            <table className="w-full text-sm text-right">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-4 py-3">العمود في ملفك</th>
                        <th className="px-4 py-3">الحقل في النظام</th>
                    </tr>
                </thead>
                <tbody>
                    {csvHeaders.map(header => (
                        <tr key={header} className="border-b">
                            <td className="px-4 py-2 font-medium text-gray-900">{header}</td>
                            <td className="px-4 py-2">
                                <select 
                                    value={mapping[header] || ''}
                                    onChange={(e) => handleMappingChange(header, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                >
                                    <option value="">-- تجاهل هذا العمود --</option>
                                    <optgroup label="معلومات العميل الأساسية">
                                        {Object.entries(CUSTOMER_FIELDS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="تفاصيل المعاملات (لإضافة فواتير)">
                                        {Object.entries(TRANSACTION_FIELDS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="بيانات ملخصة (لتحديث الرصيد الإجمالي)">
                                        {Object.entries(SUMMARY_FIELDS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            إلغاء
          </button>
          <button onClick={handleImportClick} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">
            بدء الاستيراد
          </button>
        </div>
      </div>
    </div>
  );
};

export default CsvImportModal;