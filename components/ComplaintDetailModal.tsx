

import React, { useState, useEffect } from 'react';
import { Complaint, User, ComplaintStatus, Product, UserRole } from '../types';
import StatusBadge from './StatusBadge';
import ImageLightbox from './ImageLightbox';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onAddLog: (complaintId: string, note: string) => void;
  onAction: (complaintId: string, newStatus: ComplaintStatus, logAction: string) => void;
  onActionWithInput: (complaintId: string, newStatus: ComplaintStatus, logMessageTemplate: string, title: string, prompt: string) => void;
  users: User[];
  currentUser: User;
  products: Product[];
  onViewCustomer: (customerId: string) => void;
}

const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onAddLog,
  onAction,
  onActionWithInput,
  users,
  currentUser,
  products,
  onViewCustomer
}) => {
  const [newLogNote, setNewLogNote] = useState('');
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setNewLogNote('');
    }
  }, [isOpen]);

  if (!isOpen || !complaint) return null;

  const handleAddLogClick = () => {
    onAddLog(complaint.complaintId, newLogNote);
    setNewLogNote('');
  };
  
  const productName = complaint.productId ? products.find(p => p.id === complaint.productId)?.name : null;

  const canEscalate = [UserRole.TeamLeader, UserRole.GeneralManager].includes(currentUser.role);
  const canDoAdminResolve = [UserRole.GeneralManager, UserRole.AccountsManager].includes(currentUser.role);

  const renderComplaintActions = (complaint: Complaint) => {
    // Moderators can only view and add complaints, not act on them.
    if (currentUser.role === UserRole.Moderator) {
      return <span className="text-sm text-gray-500 text-center block p-2">صلاحية عرض فقط</span>;
    }

    const isAssignedToCurrentUser = complaint.assignedTo === currentUser?.id;
    
    if (complaint.status !== ComplaintStatus.Open && !isAssignedToCurrentUser && complaint.assignedTo) {
        // Allow managers to override assignment for escalated complaints.
        if (!(complaint.status === ComplaintStatus.Escalated && canDoAdminResolve)) {
            return <span className="text-sm text-gray-500">معينة لموظف آخر</span>;
        }
    }

    switch (complaint.status) {
        case ComplaintStatus.Open:
            return (
                <button 
                    onClick={() => onAction(complaint.complaintId, ComplaintStatus.InProgress, 'استلم الشكوى وبدأ المراجعة.')} 
                    className="w-full text-sm bg-green-100 text-green-800 px-3 py-2 rounded hover:bg-green-200"
                >
                    استلام وبدء المراجعة
                </button>
            );
        case ComplaintStatus.InProgress:
             return (
                <div className="flex flex-col space-y-2">
                    <button onClick={() => onActionWithInput(complaint.complaintId, ComplaintStatus.PendingCustomer, 'تم اقتراح الحل: %s', 'اقتراح حل', 'اكتب الحل المقترح للعميل.')} className="w-full text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded hover:bg-blue-200">اقتراح حل وانتظار الرد</button>
                    {canEscalate && <button onClick={() => onAction(complaint.complaintId, ComplaintStatus.Escalated, 'تم تصعيد الشكوى.')} className="w-full text-sm bg-red-100 text-red-800 px-3 py-2 rounded hover:bg-red-200">تصعيد للمدير</button>}
                </div>
            );
        case ComplaintStatus.PendingCustomer:
            return (
                 <div className="flex flex-col space-y-2">
                    <button onClick={() => onActionWithInput(complaint.complaintId, ComplaintStatus.Resolved, 'وافق العميل على الحل. تم الحل: %s', 'تأكيد موافقة العميل', 'أضف ملاحظات الإغلاق النهائية.')} className="w-full text-sm bg-accent text-white px-3 py-2 rounded hover:bg-green-700">العميل وافق (حل الشكوى)</button>
                    <button onClick={() => onAction(complaint.complaintId, ComplaintStatus.InProgress, 'رفض العميل الحل، إعادة المراجعة.')} className="w-full text-sm bg-yellow-100 text-yellow-800 px-3 py-2 rounded hover:bg-yellow-200">العميل رفض (إعادة للمراجعة)</button>
                </div>
            );
        case ComplaintStatus.Escalated:
            return (
                 canDoAdminResolve ?
                 <button onClick={() => onActionWithInput(complaint.complaintId, ComplaintStatus.Resolved, 'تم الحل من قبل المدير: %s', 'حل إداري', 'أدخل قرار الحل النهائي كمدير.')} className="w-full text-sm bg-danger text-white px-3 py-2 rounded hover:bg-red-700">اتخاذ قرار إداري وحل الشكوى</button>
                 : <span className="text-sm text-gray-500 text-center block p-2">في انتظار قرار المدير</span>
            );
        case ComplaintStatus.Resolved:
            return <span className="text-sm text-green-600 font-semibold text-center block p-2">مكتملة</span>;
        default:
            return null;
    }
  }

  return (
    <>
      <ImageLightbox imageUrl={lightboxImageUrl} onClose={() => setLightboxImageUrl(null)} />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h2 className="text-2xl font-bold text-text-primary">{complaint.type}</h2>
                  <p className="text-sm text-text-secondary">للعميل: <button onClick={() => onViewCustomer(complaint.customerId)} className="text-link hover:underline font-semibold">{complaint.customerName}</button> ({complaint.complaintId})</p>
              </div>
              <StatusBadge status={complaint.status} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                  <h4 className="font-bold mb-2 text-md text-text-primary">الوصف الكامل</h4>
                  <p className="text-sm text-text-secondary bg-gray-50 p-3 rounded-md min-h-[80px]">{complaint.description}</p>
                   {productName && (
                      <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-200">
                          <h5 className="font-bold text-sm text-blue-800">المنتج المتعلق بالشكوى</h5>
                          <p className="text-sm text-blue-700">{productName} - اللون: {complaint.productColor}, المقاس: {complaint.productSize}</p>
                      </div>
                  )}
                  {complaint.attachments && complaint.attachments.length > 0 && (
                      <div className="mt-4">
                          <h5 className="font-bold text-sm text-text-primary">المرفقات</h5>
                          <div className="mt-2 flex flex-wrap gap-2">
                              {complaint.attachments.map((img, index) => (
                                  <button onClick={() => setLightboxImageUrl(img)} key={index} className="focus:outline-none focus:ring-2 focus:ring-primary rounded">
                                      <img src={img} alt={`attachment ${index+1}`} className="h-20 w-20 object-cover rounded border hover:opacity-80 transition-opacity cursor-pointer"/>
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
                  <div className="mt-4">
                      <h4 className="font-bold mb-2 text-md text-text-primary">إضافة تحديث يدوي</h4>
                      <div className="flex space-x-2 space-x-reverse">
                          <input 
                              type="text"
                              placeholder="أكتب ملاحظة جديدة..."
                              value={newLogNote}
                              onChange={(e) => setNewLogNote(e.target.value)}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddLogClick();
                              }}
                              className="flex-grow p-2 border border-gray-300 rounded-md text-sm"
                          />
                          <button
                              onClick={handleAddLogClick}
                              className="bg-primary text-white px-4 py-2 text-sm rounded-md hover:bg-blue-800"
                          >
                              إضافة
                          </button>
                      </div>
                  </div>
              </div>
              <div className="md:col-span-1">
                   <h4 className="font-bold mb-2 text-md text-text-primary">معلومات الشكوى</h4>
                   <div className="text-sm space-y-2">
                       <p><span className="font-semibold">الأولوية: </span>{complaint.priority}</p>
                       <p><span className="font-semibold">القناة: </span>{complaint.channel}</p>
                       <p><span className="font-semibold">الموظف: </span>{users.find(u => u.id === complaint.assignedTo)?.name || 'غير معين'}</p>
                       <p><span className="font-semibold">تاريخ الفتح: </span><br/>{new Date(complaint.dateOpened).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                       {complaint.dateClosed && <p><span className="font-semibold">تاريخ الإغلاق: </span><br/>{new Date(complaint.dateClosed).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                   </div>
                   <div className="mt-4">
                      <h4 className="block text-md font-medium text-text-primary mb-2">الإجراء المطلوب</h4>
                      {renderComplaintActions(complaint)}
                   </div>
              </div>
          </div>

          <div className="mt-6">
              <h4 className="font-bold mb-2 text-md text-text-primary">سجل الإجراءات</h4>
              <div className="bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto">
                  <ul className="list-none space-y-3">
                      {complaint.log.slice().reverse().map((entry, index) => (
                      <li key={index} className="text-xs text-text-secondary border-r-2 border-primary pr-3">
                          <p className="font-semibold text-text-primary">{entry.action}</p>
                          <p>
                          <span className="font-semibold">{entry.user}</span> - 
                          <span> {new Date(entry.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </p>
                      </li>
                      ))}
                  </ul>
              </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintDetailModal;