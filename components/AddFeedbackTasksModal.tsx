
import React, { useState, useMemo } from 'react';
import { Customer, DailyFeedbackTask, DailyFeedbackStatus } from '../types';

interface AddFeedbackTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tasks: DailyFeedbackTask[]) => void;
  customers: Customer[];
  existingTaskInvoiceIds: Set<string>;
}

interface SelectableInvoice {
  key: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceDate: string;
}

const AddFeedbackTasksModal: React.FC<AddFeedbackTasksModalProps> = ({ isOpen, onClose, onSave, customers, existingTaskInvoiceIds }) => {
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());

  const recentInvoices = useMemo(() => {
    const invoices: SelectableInvoice[] = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    customers.forEach(customer => {
      customer.log.forEach(entry => {
        if (new Date(entry.date) >= sevenDaysAgo && !existingTaskInvoiceIds.has(entry.invoiceId)) {
          invoices.push({
            key: `${customer.id}-${entry.invoiceId}`,
            customerId: customer.id,
            customerName: customer.name,
            invoiceId: entry.invoiceId,
            invoiceDate: entry.date,
          });
        }
      });
    });
    return invoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }, [customers, existingTaskInvoiceIds]);
  
  const handleToggleSelection = (key: string) => {
    const newSelection = new Set(selectedInvoices);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    setSelectedInvoices(newSelection);
  };

  const handleSave = () => {
    const tasksToAdd: DailyFeedbackTask[] = [];
    selectedInvoices.forEach(key => {
      const invoice = recentInvoices.find(inv => inv.key === key);
      if (invoice) {
        tasksToAdd.push({
          id: `dft-${invoice.invoiceId}`,
          customerId: invoice.customerId,
          customerName: invoice.customerName,
          invoiceId: invoice.invoiceId,
          invoiceDate: invoice.invoiceDate,
          status: DailyFeedbackStatus.Pending,
          lastModified: new Date().toISOString(),
        });
      }
    });
    onSave(tasksToAdd);
    onClose();
  };
  
  const handleClose = () => {
      setSelectedInvoices(new Set());
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-bold mb-2 text-text-primary">إضافة فواتير جديدة للمتابعة</h2>
        <p className="text-sm text-text-secondary mb-4">اختر الفواتير من الأسبوع الماضي التي لم تتم متابعتها بعد.</p>
        
        <div className="overflow-y-auto border rounded-lg flex-grow">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 w-12"><input type="checkbox" onChange={(e) => setSelectedInvoices(e.target.checked ? new Set(recentInvoices.map(i => i.key)) : new Set())}/></th>
                <th className="px-4 py-2">العميل</th>
                <th className="px-4 py-2">رقم الفاتورة</th>
                <th className="px-4 py-2">التاريخ</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {recentInvoices.map(invoice => (
                <tr key={invoice.key} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2"><input type="checkbox" checked={selectedInvoices.has(invoice.key)} onChange={() => handleToggleSelection(invoice.key)} /></td>
                  <td className="px-4 py-2 font-medium text-gray-900">{invoice.customerName}</td>
                  <td className="px-4 py-2 text-gray-600">{invoice.invoiceId}</td>
                  <td className="px-4 py-2 text-gray-600">{new Date(invoice.invoiceDate).toLocaleDateString('ar-EG')}</td>
                </tr>
              ))}
              {recentInvoices.length === 0 && <tr><td colSpan={4} className="text-center p-4 text-gray-500">لا توجد فواتير جديدة للمتابعة.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">إلغاء</button>
          <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800" disabled={selectedInvoices.size === 0}>
            إضافة ({selectedInvoices.size}) للمتابعة
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFeedbackTasksModal;
