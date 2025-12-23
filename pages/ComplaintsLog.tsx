import React, { useState, useMemo, useEffect } from 'react';
import { Complaint, User, ComplaintStatus, Product, UserRole, ComplaintPriority } from '../types';
import { ChevronDownIcon, FilterIcon, PlusIcon, TableIcon, KanbanIcon, CloseIcon } from '../components/icons';
import ComplaintModal from '../components/ComplaintModal';
import StatusBadge from '../components/StatusBadge';
import { mockComplaintTypes } from '../services/mockData';
import KanbanBoard from '../components/KanbanBoard';
import ComplaintDetailModal from '../components/ComplaintDetailModal';
import ImageLightbox from '../components/ImageLightbox';
import SearchableSelect from '../components/SearchableSelect';
import { createComplaint, updateComplaint } from '../src/api/complaintsApi';

interface ComplaintsLogProps {
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  users: User[];
  customers: any[]; // Use proper type
  products: Product[];
  currentUser: User;
  showNotification: (message: string, type?: 'success' | 'info') => void;
  logUserAction: (details: string) => void;
  onTriggerNotification: (complaint: Complaint, trigger: 'URGENT_NEW' | 'ESCALATION') => void;
  initialFilters?: { 
    status?: ComplaintStatus | ComplaintStatus[];
    dateOpened?: string;
    dateClosed?: string;
  } | null;
  onFiltersApplied?: () => void;
  onViewCustomer: (customerId: string) => void;
}

// Modal for user input to replace window.prompt
const ActionInputModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  title: string;
  prompt: string;
}> = ({ isOpen, onClose, onSubmit, title, prompt }) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (inputText.trim()) {
      onSubmit(inputText);
      setInputText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-text-secondary mb-4">{prompt}</p>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          autoFocus
        />
        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button onClick={() => { setInputText(''); onClose(); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            إلغاء
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
};


const ComplaintsLog: React.FC<ComplaintsLogProps> = ({ complaints, setComplaints, users, customers, products, currentUser, showNotification, logUserAction, onTriggerNotification, initialFilters, onFiltersApplied, onViewCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [filters, setFilters] = useState<{
    status: ComplaintStatus | '' | ComplaintStatus[];
    assignedTo: string;
    type: string;
    dateOpened: string;
    dateClosed: string;
  }>({
    status: '',
    assignedTo: '',
    type: '',
    dateOpened: '',
    dateClosed: '',
  });
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
  const [newLogNote, setNewLogNote] = useState('');
  const [actionInput, setActionInput] = useState<{
    complaintId: string;
    newStatus: ComplaintStatus;
    logMessageTemplate: string;
    title: string;
    prompt: string;
  } | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialFilters && onFiltersApplied) {
        setFilters({ 
            status: initialFilters.status || '',
            assignedTo: '',
            type: '',
            dateOpened: initialFilters.dateOpened || '',
            dateClosed: initialFilters.dateClosed || '',
        });
        onFiltersApplied();
    }
  }, [initialFilters, onFiltersApplied]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters({ ...filters, [name]: value });
  };
  
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const statusFilter = filters.status;
      let statusMatch = true;
      if (statusFilter && statusFilter.length > 0) {
          if (Array.isArray(statusFilter)) {
              statusMatch = statusFilter.includes(c.status);
          } else {
              statusMatch = c.status === statusFilter;
          }
      }

      return statusMatch &&
             (filters.assignedTo ? c.assignedTo === filters.assignedTo : true) &&
             (filters.type ? c.type === filters.type : true) &&
             (filters.dateOpened ? c.dateOpened.startsWith(filters.dateOpened) : true) &&
             (filters.dateClosed ? c.dateClosed?.startsWith(filters.dateClosed) : true);
    }).sort((a, b) => new Date(b.dateOpened).getTime() - new Date(a.dateOpened).getTime());
  }, [complaints, filters]);

  const handleSaveComplaint = async (complaint: Complaint) => {
    try {
      // Prepare complaint data for API (without complaintId, it will be generated by backend)
      const { complaintId, ...complaintData } = complaint;
      const complaintWithTimestamp = {
        ...complaintData,
        lastModified: new Date().toISOString(),
      };
      
      // Create complaint via API
      const createdComplaint = await createComplaint(complaintWithTimestamp);
      
      // Update local state with the created complaint (which includes the complaintId from backend)
      setComplaints([createdComplaint, ...complaints]);
      
      if (complaint.priority === ComplaintPriority.Urgent) {
        onTriggerNotification(createdComplaint, 'URGENT_NEW');
      }
      logUserAction(`تسجيل شكوى جديدة #${createdComplaint.complaintId} للعميل ${createdComplaint.customerName}.`);
      showNotification(`تم تسجيل الشكوى #${createdComplaint.complaintId} بنجاح.`, 'success');
    } catch (error: any) {
      console.error('Error saving complaint:', error);
      const errorMessage = error.message || error.response?.data?.message || 'حدث خطأ أثناء حفظ الشكوى. الرجاء المحاولة مرة أخرى.';
      showNotification(errorMessage, 'info');
    }
  };
  
  const handleAction = async (complaintId: string, newStatus: ComplaintStatus, logAction: string) => {
    const complaintToUpdate = complaints.find(c => c.complaintId === complaintId);
    if (!complaintToUpdate) return;

    if (newStatus === ComplaintStatus.Escalated && complaintToUpdate.status !== ComplaintStatus.Escalated) {
        onTriggerNotification({ ...complaintToUpdate, status: newStatus }, 'ESCALATION');
    }

    const isNewlyAssigned = complaintToUpdate.status === ComplaintStatus.Open && newStatus === ComplaintStatus.InProgress && currentUser.id;
    const now = new Date().toISOString();

    const newLogEntry = {
        user: currentUser?.name || 'Unknown Staff',
        date: now,
        action: logAction,
    };

    // Prepare updated complaint data
    const isClosing = newStatus === ComplaintStatus.Resolved && complaintToUpdate.status !== ComplaintStatus.Resolved;
    let assignedTo = complaintToUpdate.assignedTo;
    // If status is Open, assigning it now.
    if (complaintToUpdate.status === ComplaintStatus.Open) {
        assignedTo = currentUser?.id;
    }

    const updatedComplaint = {
        ...complaintToUpdate,
        status: newStatus,
        assignedTo: assignedTo,
        dateClosed: isClosing ? now : complaintToUpdate.dateClosed,
        log: [...complaintToUpdate.log, newLogEntry],
        lastModified: now,
    };

    try {
      // Update complaint via API
      // Backend uses MongoDB _id for the route parameter
      // Try _id first, fallback to complaintId if _id doesn't exist
      const complaintIdForUpdate = (complaintToUpdate as any)._id || complaintToUpdate.complaintId;
      const savedComplaint = await updateComplaint(complaintIdForUpdate, updatedComplaint);
      
      // Ensure complaintId is preserved in the saved complaint
      if (!savedComplaint.complaintId) {
        savedComplaint.complaintId = complaintToUpdate.complaintId;
      }
      
      // Update local state with the saved complaint
      setComplaints(complaints.map(c => 
        c.complaintId === complaintId ? savedComplaint : c
      ));

      logUserAction(`تحديث حالة الشكوى #${complaintId} إلى "${newStatus}".`);

      if (isNewlyAssigned) {
          showNotification(`تم تعيين الشكوى #${complaintToUpdate.complaintId} لك.`, 'success');
      } else {
          showNotification(`تم تحديث حالة الشكوى #${complaintToUpdate.complaintId} إلى "${newStatus}".`);
      }

      // Close detail modal if an action was taken on it
      if (viewingComplaint && viewingComplaint.complaintId === complaintId) {
          setViewingComplaint(prev => prev ? { ...prev, status: newStatus, log: [...prev.log, newLogEntry] } : null);
      }
    } catch (error: any) {
      console.error('Error updating complaint:', error);
      const errorMessage = error.message || error.response?.data?.message || 'حدث خطأ أثناء تحديث الشكوى. الرجاء المحاولة مرة أخرى.';
      showNotification(errorMessage, 'info');
    }
  };

  const handleOpenActionInput = (complaintId: string, newStatus: ComplaintStatus, logMessageTemplate: string, title: string, prompt: string) => {
    setActionInput({ complaintId, newStatus, logMessageTemplate, title, prompt });
  };

  const handleConfirmActionInput = (note: string) => {
    if (actionInput) {
      const logAction = actionInput.logMessageTemplate.replace('%s', note);
      handleAction(actionInput.complaintId, actionInput.newStatus, logAction);
      setActionInput(null);
    }
  };

  const canEscalate = [UserRole.TeamLeader, UserRole.GeneralManager].includes(currentUser.role);
  const canDoAdminResolve = [UserRole.GeneralManager, UserRole.AccountsManager].includes(currentUser.role);

  const renderComplaintActions = (complaint: Complaint) => {
    // Moderators can only view and add complaints, not act on them.
    if (currentUser.role === UserRole.Moderator) {
      return <span className="text-xs text-gray-500">عرض فقط</span>;
    }

    const isAssignedToCurrentUser = complaint.assignedTo === currentUser?.id;
    
    if (complaint.status !== ComplaintStatus.Open && !isAssignedToCurrentUser && complaint.assignedTo) {
        // Allow managers to override assignment for escalated complaints.
        if (!(complaint.status === ComplaintStatus.Escalated && canDoAdminResolve)) {
            return <span className="text-xs text-gray-500">معينة لموظف آخر</span>;
        }
    }

    switch (complaint.status) {
        case ComplaintStatus.Open:
            return (
                <button 
                    onClick={() => handleAction(complaint.complaintId, ComplaintStatus.InProgress, 'استلم الشكوى وبدأ المراجعة.')} 
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                >
                    استلام وبدء المراجعة
                </button>
            );
        case ComplaintStatus.InProgress:
            return (
                <div className="flex items-center space-x-2 space-x-reverse">
                    <button onClick={() => handleOpenActionInput(complaint.complaintId, ComplaintStatus.PendingCustomer, 'تم اقتراح الحل: %s', 'اقتراح حل', 'اكتب الحل المقترح للعميل.')} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200">اقتراح حل</button>
                    {canEscalate && <button onClick={() => handleAction(complaint.complaintId, ComplaintStatus.Escalated, 'تم تصعيد الشكوى.')} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200">تصعيد</button>}
                </div>
            );
        case ComplaintStatus.PendingCustomer:
            return (
                 <div className="flex items-center space-x-2 space-x-reverse">
                    <button onClick={() => handleOpenActionInput(complaint.complaintId, ComplaintStatus.Resolved, 'وافق العميل على الحل. تم الحل: %s', 'تأكيد موافقة العميل', 'أضف ملاحظات الإغلاق النهائية.')} className="text-xs bg-accent text-white px-2 py-1 rounded hover:bg-green-700">العميل وافق (حل)</button>
                    <button onClick={() => handleAction(complaint.complaintId, ComplaintStatus.InProgress, 'رفض العميل الحل، إعادة المراجعة.')} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200">العميل رفض (إعادة)</button>
                </div>
            );
        case ComplaintStatus.Escalated:
            return(
                canDoAdminResolve ?
                <button onClick={() => handleOpenActionInput(complaint.complaintId, ComplaintStatus.Resolved, 'تم الحل من قبل المدير: %s', 'حل إداري', 'أدخل قرار الحل النهائي كمدير.')} className="text-xs bg-danger text-white px-2 py-1 rounded hover:bg-red-700">حل إداري</button>
                : <span className="text-xs text-gray-500">في انتظار قرار المدير</span>
            );
        case ComplaintStatus.Resolved:
            return <span className="text-xs text-green-600 font-semibold">مكتملة</span>;
        default:
            return null;
    }
  }

  const handleAddLogEntry = async (complaintId: string, note: string) => {
    if (!note.trim()) return;
    const complaintToUpdate = complaints.find(c => c.complaintId === complaintId);
    if (!complaintToUpdate) return;

    const now = new Date().toISOString();
    const newLogEntry = {
      user: currentUser?.name || 'Unknown Staff',
      date: now,
      action: note,
    };

    const updatedComplaint = {
      ...complaintToUpdate,
      log: [...complaintToUpdate.log, newLogEntry],
      lastModified: now,
    };

    try {
      // Update complaint via API
      // Backend uses MongoDB _id for the route parameter
      const complaintIdForUpdate = (complaintToUpdate as any)._id || complaintToUpdate.complaintId;
      const savedComplaint = await updateComplaint(complaintIdForUpdate, updatedComplaint);
      
      // Ensure complaintId is preserved
      if (!savedComplaint.complaintId) {
        savedComplaint.complaintId = complaintToUpdate.complaintId;
      }
      
      // Update local state
      setComplaints(complaints.map(c =>
        c.complaintId === complaintId ? savedComplaint : c
      ));
      
      logUserAction(`إضافة ملاحظة "${note}" للشكوى #${complaintId}.`);
      setNewLogNote('');
      
      // If the detail modal is open, we need to update its content too
      if (viewingComplaint && viewingComplaint.complaintId === complaintId) {
          setViewingComplaint(prev => prev ? { ...prev, log: [...prev.log, newLogEntry] } : null);
      }
      showNotification(`تم إضافة ملاحظة للشكوى #${complaintId}.`);
    } catch (error: any) {
      console.error('Error adding log entry:', error);
      const errorMessage = error.message || error.response?.data?.message || 'حدث خطأ أثناء إضافة الملاحظة. الرجاء المحاولة مرة أخرى.';
      showNotification(errorMessage, 'info');
    }
  };


  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-text-primary">سجل الشكاوى</h1>
        <div className="flex items-center space-x-2 space-x-reverse self-end md:self-auto">
            <div className="bg-gray-200 p-1 rounded-lg flex">
                <button onClick={() => setViewMode('table')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'table' ? 'bg-white shadow' : ''}`}>
                    <TableIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setViewMode('kanban')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'kanban' ? 'bg-white shadow' : ''}`}>
                    <KanbanIcon className="w-5 h-5" />
                </button>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-800 transition-colors">
              <PlusIcon className="w-5 h-5 ml-2" />
              <span>شكوى جديدة</span>
            </button>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-2">
            <FilterIcon className="w-5 h-5 text-gray-500 ml-2" />
            <h3 className="font-semibold text-text-primary">فلاتر البحث</h3>
        </div>
        {Array.isArray(filters.status) && (
            <div className="mb-4 flex items-center gap-2 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                <span className="text-sm font-semibold text-yellow-800">فلتر نشط: الشكاوى التي لم تحل بعد</span>
                <button 
                    onClick={() => handleFilterChange('status', '')}
                    className="text-yellow-600 hover:text-yellow-800 p-1"
                    aria-label="إزالة الفلتر"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
        )}
        {filters.dateOpened && (
            <div className="mb-4 flex items-center gap-2 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                <span className="text-sm font-semibold text-yellow-800">فلتر نشط: الشكاوى المسجلة بتاريخ {filters.dateOpened}</span>
                <button 
                    onClick={() => handleFilterChange('dateOpened', '')}
                    className="text-yellow-600 hover:text-yellow-800 p-1"
                    aria-label="إزالة الفلتر"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
        )}
        {filters.dateClosed && (
            <div className="mb-4 flex items-center gap-2 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                <span className="text-sm font-semibold text-yellow-800">فلتر نشط: الشكاوى التي تم حلها بتاريخ {filters.dateClosed}</span>
                <button 
                    onClick={() => handleFilterChange('dateClosed', '')}
                    className="text-yellow-600 hover:text-yellow-800 p-1"
                    aria-label="إزالة الفلتر"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select name="status" value={Array.isArray(filters.status) ? '' : filters.status} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} className="w-full p-2 border border-border rounded-md bg-table-header-bg focus:ring-primary focus:border-primary">
            <option value="">كل الحالات</option>
            {Object.values(ComplaintStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <SearchableSelect
            options={[{value: '', label: 'كل الموظفين'}, ...users.map(u => ({ value: u.id, label: u.name }))]}
            value={filters.assignedTo}
            onChange={(value) => handleFilterChange('assignedTo', value)}
            placeholder="ابحث عن موظف..."
          />
          <SearchableSelect
            options={[{value: '', label: 'كل الأنواع'}, ...mockComplaintTypes.map(t => ({ value: t, label: t }))]}
            value={filters.type}
            onChange={(value) => handleFilterChange('type', value)}
            placeholder="ابحث عن نوع الشكوى..."
          />
          <input type="date" name="dateOpened" value={filters.dateOpened} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} className="w-full p-2 border border-border rounded-md bg-table-header-bg focus:ring-primary focus:border-primary" />
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-surface rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
                <tr>
                <th scope="col" className="px-6 py-3">رقم الشكوى</th>
                <th scope="col" className="px-6 py-3">العميل</th>
                <th scope="col" className="px-6 py-3">تاريخ الفتح</th>
                <th scope="col" className="px-6 py-3">الحالة</th>
                <th scope="col" className="px-6 py-3">الموظف المسؤول</th>
                <th scope="col" className="px-6 py-3">الإجراء المطلوب</th>
                <th scope="col" className="px-6 py-3 text-center">التفاصيل</th>
                </tr>
            </thead>
            <tbody>
                {filteredComplaints.map(c => (
                <React.Fragment key={c.complaintId}>
                    <tr className="bg-white border-b border-border hover:bg-background-muted">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.complaintId}</td>
                    <td className="px-6 py-4">
                        <button onClick={() => onViewCustomer(c.customerId)} className="text-link hover:underline font-semibold">
                            {c.customerName}
                        </button>
                    </td>
                    <td className="px-6 py-4">{new Date(c.dateOpened).toLocaleDateString('ar-EG')}</td>
                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-4">{users.find(u => u.id === c.assignedTo)?.name || 'غير معين'}</td>
                    <td className="px-6 py-4">
                       {renderComplaintActions(c)}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <button 
                        onClick={() => setExpandedComplaintId(expandedComplaintId === c.complaintId ? null : c.complaintId)}
                        className="text-gray-500 hover:text-primary p-1"
                        aria-label="عرض التفاصيل"
                        >
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${expandedComplaintId === c.complaintId ? 'rotate-180' : ''}`} />
                        </button>
                    </td>
                    </tr>
                    {expandedComplaintId === c.complaintId && (
                    <tr className="bg-background-muted">
                        <td colSpan={7} className="p-4 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold mb-2 text-sm text-text-primary">تفاصيل الشكوى</h4>
                                <p className="text-sm text-text-secondary"><span className="font-semibold">النوع:</span> {c.type}</p>
                                {c.productId && (
                                    <p className="text-sm text-text-secondary bg-gray-200 p-2 rounded-md my-1">
                                      <span className="font-semibold">المنتج:</span> {products.find(p => p.id === c.productId)?.name} ({c.productColor} - {c.productSize})
                                    </p>
                                )}
                                <p className="text-sm text-text-secondary"><span className="font-semibold">القناة:</span> {c.channel}</p>
                                <p className="text-sm text-text-secondary"><span className="font-semibold">الأولوية:</span> {c.priority}</p>
                                <p className="text-sm text-text-secondary mt-2"><span className="font-semibold">الوصف:</span> {c.description}</p>
                                {c.attachments && c.attachments.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-semibold text-text-secondary">المرفقات:</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {c.attachments.map((img, index) => (
                                                <button onClick={() => setLightboxImageUrl(img)} key={index} className="focus:outline-none focus:ring-2 focus:ring-primary rounded">
                                                    <img src={img} alt={`attachment ${index + 1}`} className="h-16 w-16 object-cover rounded border hover:opacity-80 cursor-pointer" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p className="text-sm text-text-secondary mt-4">
                                    <span className="font-semibold">تاريخ الفتح:</span> 
                                    {' '}{new Date(c.dateOpened).toLocaleString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {c.dateClosed && (
                                <p className="text-sm text-text-secondary">
                                    <span className="font-semibold">تاريخ الإغلاق:</span> 
                                    {' '}{new Date(c.dateClosed).toLocaleString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                )}
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                <h4 className="font-bold mb-2 text-sm text-text-primary">سجل الإجراءات</h4>
                                <ul className="list-none space-y-2">
                                    {c.log.map((entry, index) => (
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
                        <div className="mt-4 pt-4 border-t">
                             <h4 className="font-bold mb-2 text-sm text-text-primary">إضافة تحديث يدوي</h4>
                             <div className="flex space-x-2 space-x-reverse">
                                <input 
                                    type="text"
                                    placeholder="أكتب ملاحظة جديدة..."
                                    className="flex-grow p-2 border border-border rounded-md text-sm"
                                    onChange={(e) => setNewLogNote(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddLogEntry(c.complaintId, newLogNote);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        handleAddLogEntry(c.complaintId, newLogNote);
                                        const input = document.querySelector(`input[placeholder="أكتب ملاحظة جديدة..."]`) as HTMLInputElement;
                                        if(input) input.value = '';
                                    }}
                                    className="bg-primary text-white px-3 py-1 text-sm rounded-md hover:bg-blue-800"
                                >
                                    إضافة
                                </button>
                             </div>
                        </div>
                        </td>
                    </tr>
                    )}
                </React.Fragment>
                ))}
            </tbody>
            </table>
            {filteredComplaints.length === 0 && <p className="text-center p-4">لا توجد شكاوى تطابق البحث.</p>}
        </div>
      ) : (
        <KanbanBoard
            complaints={filteredComplaints}
            users={users}
            onCardClick={setViewingComplaint}
            onViewCustomer={onViewCustomer}
        />
      )}

      <ImageLightbox imageUrl={lightboxImageUrl} onClose={() => setLightboxImageUrl(null)} />
      <ActionInputModal 
        isOpen={!!actionInput}
        onClose={() => setActionInput(null)}
        onSubmit={handleConfirmActionInput}
        title={actionInput?.title || ''}
        prompt={actionInput?.prompt || ''}
      />
      <ComplaintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveComplaint} customers={customers} products={products} />
      <ComplaintDetailModal
        complaint={viewingComplaint}
        isOpen={!!viewingComplaint}
        onClose={() => setViewingComplaint(null)}
        onAddLog={handleAddLogEntry}
        onAction={handleAction}
        onActionWithInput={handleOpenActionInput}
        users={users}
        currentUser={currentUser}
        products={products}
        onViewCustomer={onViewCustomer}
      />
    </div>
  );
};

export default ComplaintsLog;