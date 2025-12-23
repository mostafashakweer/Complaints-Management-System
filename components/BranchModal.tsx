
import React, { useState, useEffect } from 'react';
import { Branch } from '../types';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (branch: Branch) => void;
  branchToEdit?: Branch | null;
}

const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, onSave, branchToEdit }) => {
  const [branchData, setBranchData] = useState<Partial<Branch>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (branchToEdit) {
      setBranchData(branchToEdit);
    } else {
      setBranchData({ name: '', location: '' });
    }
  }, [branchToEdit, isOpen]);

  const handleSave = () => {
    if (!branchData.name) {
      setError('اسم الفرع مطلوب.');
      return;
    }

    onSave({
      id: branchToEdit?.id || `branch-${Date.now()}`,
      ...branchData,
    } as Branch);
    
    onClose();
    setError('');
  };

  if (!isOpen) return null;

  const isEditing = !!branchToEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-text-primary">
          {isEditing ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}
        </h2>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">اسم الفرع*</label>
            <input
              type="text"
              value={branchData.name || ''}
              onChange={(e) => setBranchData({ ...branchData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">الموقع (اختياري)</label>
            <input
              type="text"
              value={branchData.location || ''}
              onChange={(e) => setBranchData({ ...branchData, location: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            إلغاء
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">
            {isEditing ? 'حفظ التغييرات' : 'إضافة الفرع'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchModal;
