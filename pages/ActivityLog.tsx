
import React, { useMemo, useState } from 'react';
import { ActivityLogEntry, User } from '../types';
import { ChevronDownIcon } from '../components/icons';

interface ActivityLogProps {
  log: ActivityLogEntry[];
  users: User[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ log, users }) => {
  const [filters, setFilters] = useState({ userId: '', date: '' });
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setExpandedUsers([]); // Collapse all on filter change
  };

  const filteredLog = useMemo(() => {
    return log.filter(entry => 
      (filters.userId ? entry.userId === filters.userId : true) &&
      (filters.date ? entry.timestamp.startsWith(filters.date) : true)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [log, filters]);
  
  const dailySummary = useMemo(() => {
    const summary: { [userId: string]: { name: string; totalDuration: number; loginCount: number } } = {};
    const logForDate = filters.date ? log.filter(l => l.timestamp.startsWith(filters.date)) : log;

    logForDate.forEach(entry => {
      if (!summary[entry.userId]) {
        summary[entry.userId] = { name: entry.userName, totalDuration: 0, loginCount: 0 };
      }
      if (entry.type === 'LOGOUT' && entry.duration) {
        summary[entry.userId].totalDuration += entry.duration;
      }
      if (entry.type === 'LOGIN') {
        summary[entry.userId].loginCount += 1;
      }
    });
    return Object.values(summary).filter(s => s.totalDuration > 0 || s.loginCount > 0);
  }, [log, filters.date]);

  const logByUser = useMemo(() => {
    // FIX: Explicitly type the accumulator in the reduce function to prevent type errors.
    return filteredLog.reduce((acc: Record<string, ActivityLogEntry[]>, entry) => {
        if (!acc[entry.userId]) {
            acc[entry.userId] = [];
        }
        acc[entry.userId].push(entry);
        return acc;
    }, {});
  }, [filteredLog]);

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => 
        prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} ثانية`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    let result = '';
    if (h > 0) result += `${h} ساعة `;
    if (m > 0) result += `${m} دقيقة `;
    if (h === 0 && s > 0) result += `${s} ثانية`;
    return result.trim();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">شيت تقارير اليوم</h1>

      <div className="bg-surface p-4 rounded-lg shadow-md mb-6">
        <h3 className="font-semibold mb-2">فلاتر البحث</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="userId" value={filters.userId} onChange={handleFilterChange} className="w-full p-2 border border-border bg-table-header-bg rounded-md">
            <option value="">كل الموظفين</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="w-full p-2 border border-border bg-table-header-bg rounded-md" />
        </div>
      </div>
      
      {filters.date && (
        <div className="bg-surface p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-bold text-text-primary mb-3">ملخص الدوام ليوم {filters.date}</h3>
            {dailySummary.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-text-secondary">
                        <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
                            <tr>
                                <th className="px-4 py-2">الموظف</th>
                                <th className="px-4 py-2">إجمالي مدة العمل</th>
                                <th className="px-4 py-2">عدد مرات تسجيل الدخول</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailySummary.map(s => (
                                <tr key={s.name} className="border-b border-border">
                                    <td className="px-4 py-2 font-medium text-text-primary">{s.name}</td>
                                    <td className="px-4 py-2">{formatDuration(s.totalDuration)}</td>
                                    <td className="px-4 py-2">{s.loginCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            ) : <p className="text-center text-sm text-gray-500 py-4">لا توجد بيانات دوام مسجلة لهذا اليوم.</p>}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary">السجل التفصيلي</h3>
        {Object.entries(logByUser).map(([userId, entries]) => {
            const user = users.find(u => u.id === userId);
            const isOpen = expandedUsers.includes(userId);
            return (
                 <div key={userId} className="bg-surface rounded-lg shadow-md overflow-hidden border border-border">
                    <button
                        onClick={() => toggleUserExpansion(userId)}
                        className="w-full flex justify-between items-center text-right p-4 font-semibold text-md text-text-primary bg-background-muted hover:bg-gray-200"
                    >
                        <span>{user?.name || `User ${userId}`} ({(entries as any).length} سجل)</span>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
                                    <tr>
                                    <th className="px-6 py-3">الوقت</th>
                                    <th className="px-6 py-3">النوع</th>
                                    <th className="px-6 py-3">التفاصيل</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(entries as any).map((entry: any) => (
                                    <tr key={entry.id} className="bg-white border-b border-border last:border-b-0 hover:bg-background-muted">
                                        <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{new Date(entry.timestamp).toLocaleString('ar-EG', { timeStyle: 'medium' })}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                        {entry.type === 'ACTION' ? <span className="bg-badge-muted-bg text-badge-muted-text px-2 py-1 rounded-full text-xs">إجراء</span>
                                        : (entry.type === 'LOGIN' ? <span className="bg-badge-success-bg text-badge-success-text px-2 py-1 rounded-full text-xs">تسجيل دخول</span> 
                                        : <span className="bg-badge-danger-bg text-badge-danger-text px-2 py-1 rounded-full text-xs">تسجيل خروج</span>)}
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{entry.details}{entry.duration ? ` (المدة: ${formatDuration(entry.duration)})` : ''}</td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )
        })}
        {filteredLog.length === 0 && <p className="text-center p-6 text-gray-500 bg-surface rounded-lg shadow-md">لا توجد سجلات تطابق البحث.</p>}
      </div>
    </div>
  );
};

export default ActivityLog;
