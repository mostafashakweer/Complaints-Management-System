import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Complaint, Customer, ComplaintStatus } from '../types';

interface ManagerDashboardProps {
  complaints: Complaint[];
  customers: Customer[];
  onNavigateToComplaints: (filters: { 
    status?: ComplaintStatus | ComplaintStatus[];
    dateOpened?: string;
    dateClosed?: string;
  }) => void;
}

const KpiCard: React.FC<{ title: string; value: string | number; description: string; onClick?: () => void; className?: string; }> = 
({ title, value, description, onClick, className = '' }) => (
  <div 
    className={`bg-surface p-6 rounded-lg shadow-md ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary border-2 border-transparent transition-all' : ''} ${className}`}
    onClick={onClick}
  >
    <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
    <p className="text-text-secondary text-xs mt-1">{description}</p>
  </div>
);

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ complaints, customers, onNavigateToComplaints }) => {
  const today = new Date().toISOString().slice(0, 10);
    
  const kpiData = useMemo(() => {
    const createdToday = complaints.filter(c => c.dateOpened.startsWith(today)).length;
    const newOpenComplaints = complaints.filter(c => c.status === ComplaintStatus.Open).length;
    const unresolvedComplaints = complaints.filter(c => 
        [ComplaintStatus.InProgress, ComplaintStatus.PendingCustomer, ComplaintStatus.Escalated].includes(c.status)
    ).length;
    const resolvedToday = complaints.filter(c => c.status === ComplaintStatus.Resolved && c.dateClosed?.startsWith(today)).length;

    return { createdToday, newOpenComplaints, unresolvedComplaints, resolvedToday };
  }, [complaints, today]);
  
  const complaintsByType = useMemo(() => {
    const counts: Record<string, number> = complaints.reduce((acc: Record<string, number>, complaint) => {
        acc[complaint.type] = (acc[complaint.type] || 0) + 1;
        return acc;
    }, {});
    // FIX: The `sort` callback was causing a type error. Added explicit types to parameters to ensure correct type inference.
    return Object.entries(counts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [complaints]);
  
  const complaintsByGovernorate = useMemo(() => {
    const customerMap = new Map(customers.map(c => [c.id, c.governorate]));
    const counts: Record<string, number> = complaints.reduce((acc: Record<string, number>, complaint) => {
        const governorate = customerMap.get(complaint.customerId);
        // FIX: The type of `governorate` was being inferred as unknown. Add a type guard to ensure it's a string.
        if (typeof governorate === 'string') {
            acc[governorate] = (acc[governorate] || 0) + 1;
        }
        return acc;
    }, {});
    // FIX: The `sort` callback was causing a type error. Added explicit types to parameters to ensure correct type inference.
    return Object.entries(counts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).map(([name, value]) => ({ name, 'عدد الشكاوى': value }));
  }, [complaints, customers]);


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4242'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">لوحة تحكم المدير</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="إجمالي الشكاوى اليوم" 
          value={kpiData.createdToday} 
          description="الشكاوى التي تم إنشاؤها اليوم. اضغط للعرض." 
          onClick={() => onNavigateToComplaints({ dateOpened: today })}
          className="bg-gray-50 border-gray-200"
        />
        <KpiCard 
          title="شكاوى مفتوحة" 
          value={kpiData.newOpenComplaints} 
          description="لم تستلم بعد. اضغط للعرض." 
          onClick={() => onNavigateToComplaints({ status: ComplaintStatus.Open })}
          className="bg-blue-50 border-blue-200"
        />
        <KpiCard 
          title="شكاوى لم تحل بعد" 
          value={kpiData.unresolvedComplaints} 
          description="تم استلامها وقيد المعالجة. اضغط للعرض."
          onClick={() => onNavigateToComplaints({ status: [ComplaintStatus.InProgress, ComplaintStatus.PendingCustomer, ComplaintStatus.Escalated] })}
          className="bg-yellow-50 border-yellow-200"
        />
        <KpiCard 
          title="تم حلها اليوم" 
          value={kpiData.resolvedToday} 
          description="الشكاوى التي تم إغلاقها اليوم. اضغط للعرض." 
          className="bg-green-50 border-green-200"
          onClick={() => onNavigateToComplaints({ status: ComplaintStatus.Resolved, dateClosed: today })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">المشاكل الأكثر تكرارًا</h3>
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
            <h3 className="text-lg font-semibold text-text-primary mb-4">توزيع الشكاوى حسب المنطقة</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complaintsByGovernorate} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip cursor={{fill: '#f3f4f6'}}/>
                    <Legend />
                    <Bar dataKey="عدد الشكاوى" fill="#1E40AF" barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;