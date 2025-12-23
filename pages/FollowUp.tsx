

import React, { useState } from 'react';
import { FollowUpTask, FollowUpStatus, User } from '../types';

interface FollowUpPageProps {
  tasks: FollowUpTask[];
  setTasks: React.Dispatch<React.SetStateAction<FollowUpTask[]>>;
  users: User[];
  currentUser: User;
  onViewCustomer: (customerId: string) => void;
}

const FollowUpPage: React.FC<FollowUpPageProps> = ({ tasks, setTasks, users, currentUser, onViewCustomer }) => {
  const [filter, setFilter] = useState<FollowUpStatus | 'all'>('all');
  const [editingTask, setEditingTask] = useState<FollowUpTask | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredTasks = tasks.filter(task => filter === 'all' || task.status === filter);

  const handleMarkAsDone = (task: FollowUpTask) => {
    setEditingTask(task);
    setResolutionNotes('');
  };

  const handleSaveResolution = () => {
    if (!editingTask) return;
    setTasks(tasks.map(t => 
      t.id === editingTask.id 
        ? { 
            ...t, 
            status: FollowUpStatus.Done, 
            resolutionNotes, 
            assignedTo: currentUser.id,
            lastModified: new Date().toISOString() 
          } 
        : t
    ));
    setEditingTask(null);
  };

  const getStatusBadge = (status: FollowUpStatus) => {
    return status === FollowUpStatus.Pending
      ? 'bg-badge-warning-bg text-badge-warning-text'
      : 'bg-badge-success-bg text-badge-success-text';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">مهام المتابعة</h1>

      <div className="mb-4">
        <div className="flex space-x-2 space-x-reverse border-b">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 text-sm font-medium ${filter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
          >
            الكل ({tasks.length})
          </button>
          <button 
            onClick={() => setFilter(FollowUpStatus.Pending)} 
            className={`px-4 py-2 text-sm font-medium ${filter === FollowUpStatus.Pending ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
          >
            معلقة ({tasks.filter(t=>t.status === FollowUpStatus.Pending).length})
          </button>
          <button 
            onClick={() => setFilter(FollowUpStatus.Done)} 
            className={`px-4 py-2 text-sm font-medium ${filter === FollowUpStatus.Done ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
          >
            تمت ({tasks.filter(t=>t.status === FollowUpStatus.Done).length})
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-right text-text-secondary">
          <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
            <tr>
              <th className="px-6 py-3">العميل</th>
              <th className="px-6 py-3">السبب</th>
              <th className="px-6 py-3">التفاصيل</th>
              <th className="px-6 py-3">الحالة</th>
              <th className="px-6 py-3">تاريخ الإنشاء</th>
              <th className="px-6 py-3">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id} className="bg-white border-b border-border hover:bg-background-muted">
                <td className="px-6 py-4 font-medium text-text-primary">
                    <button onClick={() => onViewCustomer(task.customerId)} className="text-link hover:underline font-semibold">
                        {task.customerName}
                    </button>
                </td>
                <td className="px-6 py-4">{task.reason}</td>
                <td className="px-6 py-4">{task.details}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(task.dateCreated).toLocaleDateString('ar-EG')}</td>
                <td className="px-6 py-4">
                  {task.status === FollowUpStatus.Pending ? (
                    <button onClick={() => handleMarkAsDone(task)} className="text-link hover:underline font-semibold">إنهاء المهمة</button>
                  ) : (
                    <div className="text-xs">
                        <p>بواسطة: {users.find(u => u.id === task.assignedTo)?.name || 'غير معروف'}</p>
                        <p className="text-gray-500">{task.resolutionNotes}</p>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">لا توجد مهام مطابقة.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">إنهاء مهمة المتابعة</h2>
            <p className="text-sm text-text-secondary mb-2">العميل: {editingTask.customerName}</p>
            <p className="text-sm text-text-secondary mb-4">التفاصيل: {editingTask.details}</p>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">ملاحظات الإنهاء</label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="اكتب نتيجة المتابعة مع العميل..."
              />
            </div>
            <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
              <button onClick={() => setEditingTask(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">إلغاء</button>
              <button onClick={handleSaveResolution} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpPage;