
import React, { useState, useMemo } from 'react';
import { DailyFeedbackTask, DailyFeedbackStatus, Customer, User, Branch, CustomerImpression } from '../types';
import { PlusIcon, FeedbackIcon } from '../components/icons';
import ImpressionModal from '../components/ImpressionModal';
import AddFeedbackTasksModal from '../components/AddFeedbackTasksModal';

interface DailyFeedbackPageProps {
  tasks: DailyFeedbackTask[];
  setTasks: React.Dispatch<React.SetStateAction<DailyFeedbackTask[]>>;
  customers: Customer[];
  currentUser: User;
  branches: Branch[];
  onSaveImpression: (customerId: string, impression: CustomerImpression) => void;
  onViewCustomer: (customerId: string) => void;
}

const DailyFeedbackPage: React.FC<DailyFeedbackPageProps> = ({ tasks, setTasks, customers, currentUser, branches, onSaveImpression, onViewCustomer }) => {
  const [isImpressionModalOpen, setImpressionModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [taskToEvaluate, setTaskToEvaluate] = useState<DailyFeedbackTask | null>(null);

  const pendingTasks = useMemo(() => {
    return tasks.filter(task => task.status === DailyFeedbackStatus.Pending)
                .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }, [tasks]);

  const existingTaskInvoiceIds = useMemo(() => {
    return new Set(tasks.map(task => task.invoiceId));
  }, [tasks]);

  const handleStartEvaluation = (task: DailyFeedbackTask) => {
    setTaskToEvaluate(task);
    setImpressionModalOpen(true);
  };
  
  const handleSaveAndCloseImpression = (impression: CustomerImpression) => {
      if (!taskToEvaluate) return;
      onSaveImpression(taskToEvaluate.customerId, impression);
      setImpressionModalOpen(false);
      setTaskToEvaluate(null);
  };

  const handleAddTasks = (newTasks: DailyFeedbackTask[]) => {
      setTasks(prev => [...prev, ...newTasks]);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-text-primary">التقييمات اليومية</h1>
        <button onClick={() => setAddModalOpen(true)} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-800 transition-colors self-end md:self-auto">
          <PlusIcon className="w-5 h-5 ml-2" />
          <span>إضافة فواتير لليوم</span>
        </button>
      </div>
      
      <p className="text-text-secondary mb-6">
        هذه قائمة بالعملاء الذين قاموا بعمليات شراء حديثة وينتظرون التواصل معهم لأخذ انطباعهم عن الخدمة والمنتج.
      </p>

      <div className="bg-surface rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-right text-text-secondary">
          <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
            <tr>
              <th className="px-6 py-3">العميل</th>
              <th className="px-6 py-3">رقم الفاتورة</th>
              <th className="px-6 py-3">تاريخ الفاتورة</th>
              <th className="px-6 py-3">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {pendingTasks.map(task => (
              <tr key={task.id} className="bg-white border-b border-border hover:bg-background-muted">
                <td className="px-6 py-4">
                    <button onClick={() => onViewCustomer(task.customerId)} className="text-link hover:underline font-semibold">
                        {task.customerName}
                    </button>
                </td>
                <td className="px-6 py-4">{task.invoiceId}</td>
                <td className="px-6 py-4">{new Date(task.invoiceDate).toLocaleDateString('ar-EG')}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleStartEvaluation(task)} className="bg-accent text-white px-3 py-1 rounded-md hover:bg-green-600 text-xs flex items-center gap-1">
                    <FeedbackIcon className="w-4 h-4" />
                    قيم الآن
                  </button>
                </td>
              </tr>
            ))}
            {pendingTasks.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500">
                  لا توجد مهام تقييم معلقة. عظيم!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {taskToEvaluate && (
          <ImpressionModal
            isOpen={isImpressionModalOpen}
            onClose={() => setImpressionModalOpen(false)}
            onSave={handleSaveAndCloseImpression}
            customer={customers.find(c => c.id === taskToEvaluate.customerId)!}
            currentUser={currentUser}
            branches={branches}
        />
      )}

      <AddFeedbackTasksModal 
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddTasks}
        customers={customers}
        existingTaskInvoiceIds={existingTaskInvoiceIds}
      />
    </div>
  );
};

export default DailyFeedbackPage;
