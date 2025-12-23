
import React, { useState, useMemo } from 'react';
import { Customer, User, UserRole, CustomerType, CustomerClassification, CustomerLogEntry } from '../types';
import { PlusIcon, StarIcon } from '../components/icons';
import CustomerModal from '../components/CustomerModal';
import ClassificationBadge from '../components/ClassificationBadge';


interface CustomersProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onViewCustomer: (customerId: string) => void;
  currentUser: User;
  logUserAction: (details: string) => void;
}

// FIX: Changed component definition to use React.FC to correctly type props for a React component.
const KpiFilterCard: React.FC<{ title: string; value: string | number; onClick: () => void; isActive: boolean; }> = ({ title, value, onClick, isActive }) => (
    <div onClick={onClick} className={`p-3 rounded-lg shadow-sm text-center cursor-pointer transition-all border-2 ${isActive ? 'bg-primary text-white border-blue-700 scale-105' : 'bg-surface hover:shadow-md border-transparent'}`}>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium">{title}</p>
    </div>
);

const Customers: React.FC<CustomersProps> = ({ customers, setCustomers, onViewCustomer, currentUser, logUserAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<{ classification: CustomerClassification | 'all' }>({ classification: 'all' });
  const [pointFilters, setPointFilters] = useState({ min: '', max: '' });


  const classificationCounts = useMemo(() => {
    // FIX: Explicitly type the accumulator in the reduce function to prevent type errors.
    return customers.reduce((acc: Record<string, number>, customer) => {
      acc[customer.classification] = (acc[customer.classification] || 0) + 1;
      return acc;
    }, {});
  }, [customers]);


  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
        const matchesClassification = filters.classification === 'all' || customer.classification === filters.classification;
        
        const minPoints = pointFilters.min === '' ? -Infinity : Number(pointFilters.min);
        const maxPoints = pointFilters.max === '' ? Infinity : Number(pointFilters.max);
        const matchesPoints = customer.points >= minPoints && customer.points <= maxPoints;

        const matchesSearch = searchTerm === '' ||
            customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm);
        
        return matchesClassification && matchesPoints && matchesSearch;
    });
  }, [customers, searchTerm, filters, pointFilters]);


  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    if (customers.some(c => c.id === customerData.id)) {
        alert('كود العميل الذي أدخلته موجود بالفعل. الرجاء إدخال كود فريد.');
        return;
    }

    const completeCustomer: Customer = {
      id: customerData.id!,
      joinDate: new Date().toISOString(),
      type: customerData.type || CustomerType.Normal,
      classification: CustomerClassification.Bronze,
      points: 0,
      totalPurchases: 0,
      lastPurchaseDate: null,
      hasBadReputation: false,
      source: 'Store',
      totalPointsEarned: 0,
      totalPointsUsed: 0,
      purchaseCount: 0,
      log: [] as CustomerLogEntry[],
      name: customerData.name!,
      phone: customerData.phone!,
      governorate: customerData.governorate!,
      streetAddress: customerData.streetAddress,
      email: customerData.email,
      lastModified: new Date().toISOString(),
    };

    setCustomers(prevCustomers => [completeCustomer, ...prevCustomers]);
    logUserAction(`إضافة عميل جديد: ${completeCustomer.name} (${completeCustomer.id}).`);
  };
  
  const handleClassificationFilter = (classification: CustomerClassification | 'all') => {
    setFilters(prev => ({ ...prev, classification }));
  };

  const canAddCustomer = [UserRole.GeneralManager, UserRole.TeamLeader, UserRole.Moderator].includes(currentUser.role);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-text-primary">إدارة العملاء</h1>
        {canAddCustomer && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-800 transition-colors self-end md:self-auto">
                <PlusIcon className="w-5 h-5 ml-2" />
                <span>عميل جديد</span>
            </button>
        )}
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">فلترة حسب التصنيف</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <KpiFilterCard title="كل التصنيفات" value={customers.length} onClick={() => handleClassificationFilter('all')} isActive={filters.classification === 'all'} />
                {Object.values(CustomerClassification).map(c => (
                    <KpiFilterCard key={c} title={c} value={classificationCounts[c] || 0} onClick={() => handleClassificationFilter(c)} isActive={filters.classification === c} />
                ))}
            </div>
        </div>
        <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">فلترة حسب النقاط</h3>
             <div className="grid grid-cols-2 gap-4 p-3 bg-background-muted rounded-lg border border-border h-full">
                <div>
                    <label className="text-xs text-gray-600 block mb-1">الحد الأدنى للنقاط</label>
                    <input type="number" placeholder="0" value={pointFilters.min} onChange={e => setPointFilters(p => ({...p, min: e.target.value}))} className="w-full p-2 border rounded-md text-sm" />
                </div>
                <div>
                    <label className="text-xs text-gray-600 block mb-1">الحد الأقصى للنقاط</label>
                    <input type="number" placeholder="1000" value={pointFilters.max} onChange={e => setPointFilters(p => ({...p, max: e.target.value}))} className="w-full p-2 border rounded-md text-sm" />
                </div>
            </div>
        </div>
      </div>


      <div className="bg-surface p-4 rounded-lg shadow-md mb-6">
        <input
          type="text"
          placeholder="ابحث بالكود, الاسم, أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-border rounded-md bg-table-header-bg focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="bg-surface rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-right text-text-secondary">
          <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
            <tr>
              <th scope="col" className="px-6 py-3">كود العميل</th>
              <th scope="col" className="px-6 py-3">الاسم</th>
              <th scope="col" className="px-6 py-3">التصنيف</th>
              <th scope="col" className="px-6 py-3">النقاط المتاحة</th>
              <th scope="col" className="px-6 py-3">إجمالي المشتريات</th>
              <th scope="col" className="px-6 py-3">رقم الهاتف</th>
              <th scope="col" className="px-6 py-3">آخر عملية شراء</th>
              <th scope="col" className="px-6 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id} className="bg-white border-b border-border hover:bg-background-muted">
                <td className="px-6 py-4 font-mono text-text-secondary">{customer.id}</td>
                <td className="px-6 py-4 font-medium text-text-primary">{customer.name}</td>
                <td className="px-6 py-4"><ClassificationBadge classification={customer.classification} /></td>
                <td className="px-6 py-4">
                    <div className="flex items-center">
                       {customer.points > 0 && <StarIcon className="w-4 h-4 text-yellow-400 ml-2" />}
                       <span className={customer.points > 0 ? 'font-semibold text-text-primary' : 'text-text-secondary'}>
                         {customer.points.toLocaleString('ar-EG')}
                       </span>
                    </div>
                </td>
                <td className="px-6 py-4">{customer.totalPurchases.toLocaleString('ar-EG')} جنيه</td>
                <td className="px-6 py-4">{customer.phone}</td>
                <td className="px-6 py-4">
                    {customer.lastPurchaseDate 
                        ? new Date(customer.lastPurchaseDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'}) 
                        : 'لا يوجد'}
                </td>
                <td className="px-6 py-4">
                    <button onClick={() => onViewCustomer(customer.id)} className="text-link hover:underline font-semibold">عرض الملف الشخصي</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && <p className="text-center p-4">لا يوجد عملاء يطابقون البحث.</p>}
      </div>
      <CustomerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
      />
    </div>
  );
};

export default Customers;
