

import React, { useState, useMemo } from 'react';
import { Branch, Customer, CustomerImpression } from '../types';
import { BranchIcon, FeedbackIcon, UsersIcon, StarIcon as StarIconFilled } from '../components/icons';

interface BranchesPageProps {
  branches: Branch[];
  customers: Customer[];
}

const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <StarIconFilled key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
        ))}
    </div>
);

const ImpressionCard: React.FC<{ impression: CustomerImpression, customerName: string }> = ({ impression, customerName }) => (
    <div className="bg-white rounded-lg shadow p-3 border-l-4 border-info">
        <div className="flex justify-between items-start mb-2">
            <div>
                <p className="font-bold text-sm text-text-primary">{customerName}</p>
                <p className="text-xs text-text-secondary">{new Date(impression.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</p>
            </div>
        </div>
        <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
                <span>جودة المنتج</span>
                <StarRatingDisplay rating={impression.productQualityRating} />
            </div>
            <div className="flex items-center justify-between">
                <span>تجربة الفرع</span>
                <StarRatingDisplay rating={impression.branchExperienceRating} />
            </div>
        </div>
    </div>
);

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-background-muted p-4 rounded-lg flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-full text-primary">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            <p className="text-sm font-medium text-text-secondary">{title}</p>
        </div>
    </div>
);

const BranchesPage: React.FC<BranchesPageProps> = ({ branches, customers }) => {
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(branches.length > 0 ? branches[0].id : null);

    const impressionsByBranch = useMemo(() => {
        return customers.flatMap(c => 
            (c.impressions || []).map(imp => ({ ...imp, customerName: c.name }))
        ).reduce((acc, imp) => {
            if (!acc[imp.branchId]) {
                acc[imp.branchId] = [];
            }
            acc[imp.branchId].push(imp);
            return acc;
        }, {} as Record<string, (CustomerImpression & {customerName: string})[]>);
    }, [customers]);

    const selectedBranch = branches.find(b => b.id === selectedBranchId);
    
    const branchKpis = useMemo(() => {
        if (!selectedBranchId) return null;

        const branchCustomers = customers.filter(c => c.primaryBranchId === selectedBranchId);
        const branchImpressions = (impressionsByBranch[selectedBranchId] || []);

        const totalImpressions = branchImpressions.length;
        if (totalImpressions === 0) {
            return {
                customerCount: branchCustomers.length,
                impressionCount: 0,
                avgProductRating: 'N/A',
                avgServiceRating: 'N/A'
            };
        }

        const totalProductRating = branchImpressions.reduce((acc, imp) => acc + imp.productQualityRating, 0);
        const totalServiceRating = branchImpressions.reduce((acc, imp) => acc + imp.branchExperienceRating, 0);
        
        return {
            customerCount: branchCustomers.length,
            impressionCount: totalImpressions,
            avgProductRating: (totalProductRating / totalImpressions).toFixed(1),
            avgServiceRating: (totalServiceRating / totalImpressions).toFixed(1),
        };
    }, [selectedBranchId, customers, impressionsByBranch]);

    const branchCustomers = selectedBranchId ? customers.filter(c => c.primaryBranchId === selectedBranchId) : [];
    const branchImpressions = (selectedBranchId ? impressionsByBranch[selectedBranchId] : []) || [];
    branchImpressions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <h1 className="text-3xl font-bold text-text-primary mb-6">تقارير الفروع</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Branches List */}
                <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                    <div className="bg-surface rounded-lg shadow-md p-4 sticky top-4">
                        <h2 className="text-lg font-bold text-text-primary mb-3">قائمة الفروع</h2>
                        <div className="space-y-2">
                            {branches.map(branch => (
                                <button 
                                    key={branch.id} 
                                    onClick={() => setSelectedBranchId(branch.id)}
                                    className={`w-full text-right p-3 rounded-md transition-colors flex items-center gap-3 ${selectedBranchId === branch.id ? 'bg-primary text-white' : 'hover:bg-background-muted'}`}
                                >
                                    <BranchIcon className="w-5 h-5" />
                                    <span>{branch.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Branch Details */}
                <div className="flex-grow">
                    {selectedBranch ? (
                        <div className="space-y-6">
                            <div className="bg-surface p-6 rounded-lg shadow-md">
                                <h2 className="text-2xl font-bold text-primary mb-2">{selectedBranch.name}</h2>
                                <p className="text-text-secondary">{selectedBranch.location}</p>
                            </div>
                            
                            {/* KPIs */}
                            {branchKpis && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <KpiCard title="عملاء الفرع" value={branchKpis.customerCount} icon={<UsersIcon className="w-6 h-6"/>} />
                                    <KpiCard title="إجمالي الانطباعات" value={branchKpis.impressionCount} icon={<FeedbackIcon className="w-6 h-6"/>} />
                                    <KpiCard title="متوسط تقييم المنتج" value={branchKpis.avgProductRating} icon={<StarIconFilled className="w-6 h-6"/>} />
                                    <KpiCard title="متوسط تقييم الخدمة" value={branchKpis.avgServiceRating} icon={<StarIconFilled className="w-6 h-6"/>} />
                                </div>
                            )}

                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Customers */}
                                <div className="bg-surface p-4 rounded-lg shadow-md">
                                    <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2"><UsersIcon className="w-5 h-5" /> عملاء الفرع ({branchCustomers.length})</h3>
                                    <div className="max-h-80 overflow-y-auto pr-2">
                                        {branchCustomers.length > 0 ? (
                                            <ul className="divide-y divide-border">
                                                {branchCustomers.map(c => (
                                                    <li key={c.id} className="py-2 flex justify-between items-center">
                                                        <span className="font-semibold">{c.name}</span>
                                                        <span className="text-sm text-text-secondary">{c.phone}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-sm text-text-secondary text-center py-4">لا يوجد عملاء أساسيون لهذا الفرع.</p>}
                                    </div>
                                </div>
                                
                                {/* Impressions */}
                                <div className="bg-surface p-4 rounded-lg shadow-md">
                                    <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2"><FeedbackIcon className="w-5 h-5" /> آخر الانطباعات ({branchImpressions.length})</h3>
                                    <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                                        {branchImpressions.length > 0 ? (
                                            branchImpressions.slice(0, 10).map(imp => ( // Show latest 10
                                                <ImpressionCard key={imp.id} impression={imp} customerName={imp.customerName} />
                                            ))
                                        ) : <p className="text-sm text-text-secondary text-center py-4">لا توجد انطباعات مسجلة لهذا الفرع.</p>}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="bg-surface p-16 rounded-lg shadow-md text-center sticky top-4">
                            <p className="text-text-secondary">الرجاء اختيار فرع من القائمة لعرض تقاريره.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BranchesPage;