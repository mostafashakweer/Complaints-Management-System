
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  userToEdit?: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [userData, setUserData] = useState<Partial<User>>({ role: UserRole.Staff });
  const [error, setError] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setUserData({ ...userToEdit, password: '' }); // Don't show password on edit
    } else {
      setUserData({ role: UserRole.Staff, name: '', username: '', password: '', phone: '', email: '' });
    }
  }, [userToEdit, isOpen]);

  const handleSave = () => {
    if (!userData.name || !userData.username || (!userToEdit && !userData.password)) {
      setError('الرجاء تعبئة الحقول الإلزامية: الاسم، اسم المستخدم، وكلمة المرور.');
      return;
    }

    onSave({
      id: userToEdit?.id || `user-${Date.now()}`,
      ...userData,
      role: userData.role || UserRole.Staff,
    } as User);
    
    onClose();
    setError('');
  };

  if (!isOpen) return null;

  const isEditing = !!userToEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-text-primary">
          {isEditing ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
        </h2>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">الاسم الكامل*</label>
            <input
              type="text"
              value={userData.name || ''}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">اسم المستخدم*</label>
            <input
              type="text"
              value={userData.username || ''}
              onChange={(e) => setUserData({ ...userData, username: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
                كلمة المرور*
                {isEditing && <span className="text-xs text-gray-500"> (اتركه فارغاً لعدم التغيير)</span>}
            </label>
            <input
              type="password"
              placeholder={isEditing ? 'ادخل كلمة مرور جديدة' : ''}
              value={userData.password || ''}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">الدور (الصلاحية)*</label>
            <select
              value={userData.role}
              onChange={(e) => setUserData({ ...userData, role: e.target.value as UserRole })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">رقم الهاتف</label>
            <input
              type="tel"
              value={userData.phone || ''}
              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={userData.email || ''}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            إلغاء
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">
            {isEditing ? 'حفظ التغييرات' : 'إضافة الموظف'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
