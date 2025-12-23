import React, { useState } from 'react';
import { Customer, CustomerType } from '../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({ type: CustomerType.Normal });
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!newCustomer.id || !newCustomer.name || !newCustomer.phone || !newCustomer.governorate) {
      setError('الرجاء تعبئة الحقول الإلزامية: كود العميل، الاسم، الهاتف، والمحافظة.');
      return;
    }

    onSave(newCustomer);
    handleClose();
  };
  
  const handleClose = () => {
    onClose();
    setNewCustomer({ type: CustomerType.Normal });
    setError('');
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-text-primary">إضافة عميل جديد</h2>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">كود العميل*</label>
            <input
              type="text"
              placeholder="CUST-0005"
              value={newCustomer.id || ''}
              onChange={(e) => setNewCustomer({ ...newCustomer, id: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">اسم العميل*</label>
            <input
              type="text"
              value={newCustomer.name || ''}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">رقم الهاتف*</label>
            <input
              type="tel"
              value={newCustomer.phone || ''}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">نوع العميل*</label>
            <select
              value={newCustomer.type}
              onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value as CustomerType })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              {Object.values(CustomerType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">المحافظة*</label>
            <input
              type="text"
              value={newCustomer.governorate || ''}
              onChange={(e) => setNewCustomer({ ...newCustomer, governorate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">عنوان الشارع (اختياري)</label>
            <textarea
              rows={2}
              value={newCustomer.streetAddress || ''}
              onChange={(e) => setNewCustomer({ ...newCustomer, streetAddress: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            ></textarea>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            إلغاء
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">
            حفظ العميل
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;