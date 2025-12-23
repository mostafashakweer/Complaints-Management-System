

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Complaint, User, UserRole } from '../types';
import { ComplaintStatus } from '../types';

interface DashboardProps {
  complaints: Complaint[];
  users: User[];
}

const KpiCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
  <div className="bg-surface p-6 rounded-lg shadow-md">
    <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
    <p className="text-text-secondary text-xs mt-1">{description}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ complaints, users }) => {
    
  const kpiData = useMemo(() => {
    const openComplaints = complaints.filter(c => c.status !== ComplaintStatus.Resolved).length;
    
    const today = new Date().toISOString().slice(0, 10);
    const resolvedToday = complaints.filter(c => c.status === ComplaintStatus.Resolved && c.dateClosed?.startsWith(today)).length;
    
    const resolvedWithTime = complaints.filter(c => c.status === ComplaintStatus.Resolved && c.dateOpened && c.dateClosed);
    const totalResolutionTime = resolvedWithTime.reduce((acc, c) => {
      const open = new Date(c.dateOpened).getTime();
      const closed = new Date(c.dateClosed!).getTime();
      return acc + (closed - open);
    }, 0);
    const avgResolutionHours = resolvedWithTime.length > 0 ? (totalResolutionTime / resolvedWithTime.length / (1000 * 60 * 60)).toFixed(1) : 0;

    const urgentUnresolved = complaints.filter(c => c.priority === 'عاجلة' && c.status !== ComplaintStatus.Resolved).length;

    return { openComplaints, resolvedToday, avgResolutionHours, urgentUnresolved };
  }, [complaints]);
  
  const complaintsByType = useMemo(() => {
    const counts = complaints.reduce((acc, complaint) => {
        acc[complaint.type] = (acc[complaint.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const performanceByEmployee = useMemo(() => {
    const staffUsers = users.filter(u => u.role === UserRole.Staff);
    return staffUsers.map(user => {
        const resolvedCount = complaints.filter(c => c.assignedTo === user.id && c.status === ComplaintStatus.Resolved).length;
        return { name: user.name, 'شكاوى تم حلها': resolvedCount };
    });
  }, [complaints, users]);


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4242'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="الشكاوى المفتوحة" value={kpiData.openComplaints} description="إجمالي الشكاوى التي لم تحل بعد" />
        <KpiCard title="تم حلها اليوم" value={kpiData.resolvedToday} description="الشكاوى التي تم إغلاقها اليوم" />
        <KpiCard title="متوسط وقت الحل" value={`${kpiData.avgResolutionHours} ساعة`} description="متوسط الوقت المستغرق لحل شكوى" />
        <KpiCard title="شكاوى عاجلة" value={kpiData.urgentUnresolved} description="الشكاوى العاجلة التي لم تحل" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">الشكاوى حسب النوع</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={complaintsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                        {complaintsByType.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} شكوى`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">أداء الموظفين (آخر شهر)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceByEmployee} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value) => [`${value} شكوى`, 'العدد']}/>
                    <Legend />
                    <Bar dataKey="شكاوى تم حلها" fill="#1E40AF" barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;