

import React, { useMemo, useState } from 'react';
import { Complaint, User, Customer, ComplaintStatus, DailyInquiry, UserRole } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';


interface ReportsProps {
  complaints: Complaint[];
  users: User[];
  customers: Customer[];
  dailyInquiries: DailyInquiry[];
}

const ReportCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-surface p-6 rounded-lg shadow-md mb-8">
    <h2 className="text-xl font-bold text-text-primary mb-4 border-b pb-2">{title}</h2>
    {children}
  </div>
);

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#DC2626', '#6B7280', '#9333EA'];

type ReportTab = 'summary' | 'complaints' | 'customers' | 'inquiries';

const Reports: React.FC<ReportsProps> = ({ complaints, users, customers, dailyInquiries }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  
  const teamPerformance = useMemo(() => {
    const staff = users.filter(u => u.role === UserRole.Staff);
    return staff.map(user => {
      const assigned = complaints.filter(c => c.assignedTo === user.id);
      const resolved = assigned.filter(c => c.status === ComplaintStatus.Resolved);
      const totalTime = resolved.reduce((acc, c) => {
        if (c.dateClosed) {
          return acc + (new Date(c.dateClosed).getTime() - new Date(c.dateOpened).getTime());
        }
        return acc;
      }, 0);
      const avgTime = resolved.length > 0 ? (totalTime / resolved.length / (1000 * 60 * 60)).toFixed(1) : 'N/A';
      return { name: user.name, assigned: assigned.length, resolved: resolved.length, avgTime, 'شكاوى محلولة': resolved.length };
    });
  }, [complaints, users]);
  
  const problemTypes = useMemo(() => {
    const counts: Record<string, number> = complaints.reduce((acc: Record<string, number>, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
    }, {});
    return (Object.entries(counts) as [string, number][]).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).map(([name, value])=>({name, value}));
  }, [complaints]);

  const complaintsByStatus = useMemo(() => {
    const counts: Record<string, number> = complaints.reduce((acc: Record<string, number>, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const overdueComplaints = useMemo(() => {
    const now = new Date().getTime();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    return complaints.filter(c => 
        (c.status === ComplaintStatus.Open || c.status === ComplaintStatus.InProgress) &&
        (now - new Date(c.dateOpened).getTime() > fortyEightHours)
    );
  }, [complaints]);

  const topCustomers = useMemo(() => {
      const counts: Record<string, number> = complaints.reduce((acc: Record<string, number>, c) => {
          acc[c.customerId] = (acc[c.customerId] || 0) + 1;
          return acc;
      }, {});
      return (Object.entries(counts) as [string, number][])
        .map(([customerId, count]) => ({
            name: customers.find(c => c.id === customerId)?.name || 'Unknown',
            count
        }))
        .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
        .slice(0, 10);
  }, [complaints, customers]);
  
  const inquiriesByProduct = useMemo(() => {
    const counts: Record<string, number> = dailyInquiries.reduce((acc: Record<string, number>, inquiry) => {
        acc[inquiry.productInquiry] = (acc[inquiry.productInquiry] || 0) + 1;
        return acc;
    }, {});
    return (Object.entries(counts) as [string, number][])
        .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, 'عدد الاستفسارات': value }));
  }, [dailyInquiries]);
  
  const inquiriesByGovernorate = useMemo(() => {
    const counts: Record<string, number> = dailyInquiries.reduce((acc: Record<string, number>, inquiry) => {
        acc[inquiry.customerGovernorate] = (acc[inquiry.customerGovernorate] || 0) + 1;
        return acc;
    }, {});
    return (Object.entries(counts) as [string, number][])
        .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));
  }, [dailyInquiries]);
  
  const tabs: { id: ReportTab, label: string }[] = [
      { id: 'summary', label: 'ملخص الأداء' },
      { id: 'complaints', label: 'تحليل الشكاوى' },
      { id: 'customers', label: 'تحليل العملاء' },
      { id: 'inquiries', label: 'تحليل الاستفسارات' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <>
            <ReportCard title="توزيع الشكاوى حسب الحالة">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={complaintsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {complaintsByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} شكوى`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ReportCard>
            <ReportCard title="تقرير أداء الفريق">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamPerformance} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(value) => [`${value} شكوى`, 'العدد']} />
                      <Legend />
                      <Bar dataKey="شكاوى محلولة" fill="#1E40AF" barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <table className="w-full text-sm text-right text-text-secondary">
                  <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
                    <tr>
                      <th className="px-4 py-2">الموظف</th>
                      <th className="px-4 py-2">مستلمة</th>
                      <th className="px-4 py-2">محلولة</th>
                      <th className="px-4 py-2">متوسط الحل (ساعة)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPerformance.map(p => (
                      <tr key={p.name} className="border-b border-border">
                        <td className="px-4 py-2 font-medium text-text-primary">{p.name}</td>
                        <td className="px-4 py-2">{p.assigned}</td>
                        <td className="px-4 py-2">{p.resolved}</td>
                        <td className="px-4 py-2">{p.avgTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportCard>
          </>
        );
      case 'complaints':
        return (
          <>
            <ReportCard title="تقرير أنواع المشاكل الأكثر تكراراً">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={problemTypes} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip />
                      <Bar dataKey="value" name="عدد الشكاوى" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <table className="w-full text-sm text-right text-text-secondary">
                  <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
                    <tr>
                      <th className="px-4 py-2">نوع المشكلة</th>
                      <th className="px-4 py-2">عدد الشكاوى</th>
                      <th className="px-4 py-2">النسبة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problemTypes.map(({ name, value }) => (
                      <tr key={name} className="border-b border-border">
                        <td className="px-4 py-2 font-medium text-text-primary">{name}</td>
                        <td className="px-4 py-2">{value}</td>
                        <td className="px-4 py-2">{((value / complaints.length) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportCard>
            <ReportCard title="تقرير الشكاوى المتأخرة (أكثر من 48 ساعة)">
              <table className="w-full text-sm text-right text-text-secondary">
                <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
                  <tr>
                    <th className="px-4 py-2">رقم الشكوى</th>
                    <th className="px-4 py-2">العميل</th>
                    <th className="px-4 py-2">تاريخ الفتح</th>
                    <th className="px-4 py-2">الموظف المسؤول</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueComplaints.map(c => (
                    <tr key={c.complaintId} className="border-b border-border">
                      <td className="px-4 py-2 font-medium text-text-primary">{c.complaintId}</td>
                      <td className="px-4 py-2">{c.customerName}</td>
                      <td className="px-4 py-2">{new Date(c.dateOpened).toLocaleString('ar-EG')}</td>
                      <td className="px-4 py-2">{users.find(u => u.id === c.assignedTo)?.name || 'غير معين'}</td>
                    </tr>
                  ))}
                  {overdueComplaints.length === 0 && <tr><td colSpan={4} className="text-center p-4">لا توجد شكاوى متأخرة حالياً.</td></tr>}
                </tbody>
              </table>
            </ReportCard>
          </>
        );
      case 'customers':
        return (
          <ReportCard title="تقرير العملاء الأكثر تقديماً للشكاوى">
            <table className="w-full text-sm text-right text-text-secondary">
              <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
                <tr>
                  <th className="px-4 py-2">اسم العميل</th>
                  <th className="px-4 py-2">عدد الشكاوى</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map(c => (
                  <tr key={c.name} className="border-b border-border">
                    <td className="px-4 py-2 font-medium text-text-primary">{c.name}</td>
                    <td className="px-4 py-2">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportCard>
        );
      case 'inquiries':
        return (
          <ReportCard title="تقرير استفسارات المنتجات والمحافظات">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">المنتجات الأكثر طلباً (أعلى 10)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inquiriesByProduct} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip formatter={(value) => [`${value} استفسار`, 'العدد']} />
                    <Bar dataKey="عدد الاستفسارات" fill="#9333EA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">المحافظات الأكثر استفساراً (أعلى 10)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={inquiriesByGovernorate} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                      {inquiriesByGovernorate.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} استفسار`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ReportCard>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">التقارير التحليلية</h1>
      
      <div className="mb-6 border-b border-border flex space-x-4 space-x-reverse">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {renderContent()}
      </div>

    </div>
  );
};

export default Reports;