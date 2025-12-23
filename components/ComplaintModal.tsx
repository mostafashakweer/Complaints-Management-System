
import React, { useState, useMemo } from 'react';
import { Complaint, Customer, ComplaintChannel, ComplaintPriority, ComplaintStatus, Product } from '../types';
import { mockComplaintTypes } from '../services/mockData';
import SearchableSelect from './SearchableSelect';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (complaint: Complaint) => void;
  customers: Customer[];
  products: Product[];
}

const ComplaintModal: React.FC<ComplaintModalProps> = ({ isOpen, onClose, onSave, customers, products }) => {
  const [newComplaint, setNewComplaint] = useState<Partial<Complaint>>({
    status: ComplaintStatus.Open,
    priority: ComplaintPriority.Normal,
    channel: ComplaintChannel.Phone,
    attachments: [],
  });
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // FIX: Explicitly type `file` as `File` to fix type inference issue where it was considered `unknown`.
    const promises = files.map((file: File) => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    Promise.all(promises).then(base64Images => {
        setNewComplaint(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), ...base64Images]
        }));
    });
  };

  const removeAttachment = (index: number) => {
      setNewComplaint(prev => ({
          ...prev,
          attachments: prev.attachments?.filter((_, i) => i !== index)
      }));
  };

  const handleSave = () => {
    if (!newComplaint.customerId || !newComplaint.type || !newComplaint.description) {
      setError('الرجاء تعبئة الحقول الإلزامية: العميل، نوع الشكوى، والوصف.');
      return;
    }
    
    const selectedCustomer = customers.find(c => c.id === newComplaint.customerId);
    const dateOpened = new Date().toISOString();

    const completeComplaint: Complaint = {
      complaintId: `CMPT-${Date.now()}`,
      dateOpened: dateOpened,
      status: ComplaintStatus.Open,
      priority: newComplaint.priority || ComplaintPriority.Normal,
      channel: newComplaint.channel || ComplaintChannel.Phone,
      dateClosed: null,
      resolutionNotes: '',
      ...newComplaint,
      customerId: newComplaint.customerId,
      customerName: selectedCustomer?.name || 'Unknown',
      type: newComplaint.type,
      description: newComplaint.description,
      attachments: newComplaint.attachments || [],
      log: [{ user: 'System', date: dateOpened, action: 'تم تسجيل الشكوى.' }],
      lastModified: dateOpened,
    };
    onSave(completeComplaint);
    onClose();
    setNewComplaint({
        status: ComplaintStatus.Open,
        priority: ComplaintPriority.Normal,
        channel: ComplaintChannel.Phone,
        attachments: [],
    });
    setError('');
  };

  const isProductOrInvoiceComplaint = newComplaint.type === 'مشكلة في جودة المنتج' || newComplaint.type === 'مشكلة في الفاتورة';
  const isProductComplaint = newComplaint.type === 'مشكلة في جودة المنتج';


  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === newComplaint.productId);
  }, [products, newComplaint.productId]);

  const availableColors = useMemo(() => {
    if (!selectedProduct) return [];
    // Get unique color names from variations
    return [...new Set(selectedProduct.variations.map(v => v.colorName))];
  }, [selectedProduct]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-text-primary">تسجيل شكوى جديدة</h2>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">العميل*</label>
            <SearchableSelect
              options={customers.map(customer => ({ value: customer.id, label: `${customer.name} - ${customer.phone}` }))}
              value={newComplaint.customerId || ''}
              onChange={(value) => setNewComplaint({ ...newComplaint, customerId: value })}
              placeholder="ابحث بالاسم أو رقم الهاتف..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">نوع الشكوى*</label>
            <select
              value={newComplaint.type || ''}
              onChange={(e) => setNewComplaint({ ...newComplaint, type: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="" disabled>اختر النوع</option>
              {mockComplaintTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {isProductComplaint && (
            <>
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">المنتج</label>
                      <select
                          value={newComplaint.productId || ''}
                          onChange={(e) => setNewComplaint({ ...newComplaint, productId: e.target.value, productColor: '', productSize: '' })}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      >
                          <option value="">اختر المنتج</option>
                          {products.map(product => (
                              <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">اللون</label>
                      <select
                          value={newComplaint.productColor || ''}
                          onChange={(e) => setNewComplaint({ ...newComplaint, productColor: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                          disabled={!selectedProduct}
                      >
                          <option value="">اختر اللون</option>
                          {availableColors.map(color => (
                              <option key={color} value={color}>{color}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">المقاس</label>
                      <select
                          value={newComplaint.productSize || ''}
                          onChange={(e) => setNewComplaint({ ...newComplaint, productSize: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                          disabled={!selectedProduct}
                      >
                          <option value="">اختر المقاس</option>
                          {['M', 'L', 'XL', 'XXL'].map(size => (
                              <option key={size} value={size}>{size}</option>
                          ))}
                      </select>
                  </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">قناة التواصل</label>
            <select
              value={newComplaint.channel}
              onChange={(e) => setNewComplaint({ ...newComplaint, channel: e.target.value as ComplaintChannel })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              {Object.values(ComplaintChannel).map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">الأولوية</label>
            <select
              value={newComplaint.priority}
              onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value as ComplaintPriority })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              {Object.values(ComplaintPriority).map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">وصف المشكلة*</label>
            <textarea
              rows={4}
              value={newComplaint.description || ''}
              onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              placeholder="اكتب تفاصيل الشكوى هنا..."
            ></textarea>
          </div>
           {isProductOrInvoiceComplaint && (
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">إرفاق صور (اختياري)</label>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
                    {newComplaint.attachments && newComplaint.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {newComplaint.attachments.map((img, index) => (
                                <div key={index} className="relative">
                                    <img src={img} alt={`attachment ${index+1}`} className="h-16 w-16 object-cover rounded"/>
                                    <button onClick={() => removeAttachment(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center -mt-1 -mr-1">&times;</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            إلغاء
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">
            حفظ الشكوى
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;
