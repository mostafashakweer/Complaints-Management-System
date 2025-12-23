

import React, { useState } from 'react';
import { Customer, User, CustomerImpression, DiscoveryChannel, Branch } from '../types';
import SearchableSelect from './SearchableSelect';

interface ImpressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (impression: CustomerImpression) => void;
  customer: Customer;
  currentUser: User;
  branches: Branch[];
}

const StarRating: React.FC<{ rating: number; setRating: (rating: number) => void; }> = ({ rating, setRating }) => {
    return (
        <div className="flex flex-row-reverse justify-end items-center">
            {[5, 4, 3, 2, 1].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-colors duration-150 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                    aria-label={`Rate ${star} stars`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};


const ImpressionModal: React.FC<ImpressionModalProps> = ({ isOpen, onClose, onSave, customer, currentUser, branches }) => {
    const [impressionData, setImpressionData] = useState<Partial<Omit<CustomerImpression, 'id' | 'date' | 'recordedByUserId' | 'recordedByUserName'>>>({
        productQualityRating: 0,
        branchExperienceRating: 0,
        isFirstVisit: true,
        discoveryChannel: DiscoveryChannel.Facebook,
        branchId: customer.primaryBranchId || (branches.length > 0 ? branches[0].id : ''),
        relatedInvoiceIds: [],
    });
    const [error, setError] = useState('');

    const handleInvoiceSelection = (invoiceId: string) => {
        setImpressionData(p => {
            const currentIds = p.relatedInvoiceIds || [];
            const newIds = currentIds.includes(invoiceId)
                ? currentIds.filter(id => id !== invoiceId)
                : [...currentIds, invoiceId];
            return { ...p, relatedInvoiceIds: newIds };
        });
    };

    const handleSave = () => {
        if (impressionData.productQualityRating === 0 || impressionData.branchExperienceRating === 0) {
            setError('الرجاء تعبئة تقييم المنتج وتقييم الفرع.');
            return;
        }
        if (!impressionData.branchId) {
            setError('الرجاء اختيار الفرع الذي تمت زيارته.');
            return;
        }

        const newImpression: CustomerImpression = {
            id: `imp-${Date.now()}`,
            date: new Date().toISOString(),
            recordedByUserId: currentUser.id,
            recordedByUserName: currentUser.name,
            productQualityRating: impressionData.productQualityRating,
            productQualityNotes: impressionData.productQualityNotes,
            branchExperienceRating: impressionData.branchExperienceRating,
            branchExperienceNotes: impressionData.branchExperienceNotes,
            discoveryChannel: impressionData.discoveryChannel!,
            isFirstVisit: impressionData.isFirstVisit!,
            relatedInvoiceIds: impressionData.relatedInvoiceIds,
            branchId: impressionData.branchId!,
            visitTime: impressionData.visitTime,
        };

        onSave(newImpression);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4 text-text-primary">تسجيل انطباع العميل: {customer.name}</h2>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <div className="overflow-y-auto pr-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-md font-semibold text-text-primary mb-2">الفرع الذي تمت زيارته*</label>
                            <SearchableSelect
                                options={branches.map(branch => ({ value: branch.id, label: branch.name }))}
                                value={impressionData.branchId || ''}
                                onChange={(value) => setImpressionData(p => ({...p, branchId: value}))}
                                placeholder="ابحث عن فرع..."
                             />
                        </div>
                        <div>
                            <label className="block text-md font-semibold text-text-primary mb-2">وقت الزيارة (اختياري)</label>
                            <input
                                type="time"
                                value={impressionData.visitTime || ''}
                                onChange={(e) => setImpressionData(p => ({...p, visitTime: e.target.value}))}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-md font-semibold text-text-primary mb-2">1. رأيك في الخامات والمنتج؟</label>
                        <StarRating 
                            rating={impressionData.productQualityRating!}
                            setRating={(r) => setImpressionData(p => ({ ...p, productQualityRating: r }))}
                        />
                        <textarea
                            rows={2}
                            placeholder="ملاحظات إضافية على المنتج (اختياري)"
                            value={impressionData.productQualityNotes || ''}
                            onChange={(e) => setImpressionData(p => ({ ...p, productQualityNotes: e.target.value }))}
                            className="mt-2 w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                        ></textarea>
                    </div>

                     <div>
                        <label className="block text-md font-semibold text-text-primary mb-2">2. المعاملة في الفرع كانت كويسة؟</label>
                        <StarRating 
                             rating={impressionData.branchExperienceRating!}
                             setRating={(r) => setImpressionData(p => ({ ...p, branchExperienceRating: r }))}
                        />
                         <textarea
                            rows={2}
                            placeholder="ملاحظات إضافية على الخدمة (اختياري)"
                            value={impressionData.branchExperienceNotes || ''}
                            onChange={(e) => setImpressionData(p => ({ ...p, branchExperienceNotes: e.target.value }))}
                            className="mt-2 w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-md font-semibold text-text-primary mb-2">3. عرفت ضجة منين؟</label>
                            <select
                                value={impressionData.discoveryChannel}
                                onChange={(e) => setImpressionData(p => ({...p, discoveryChannel: e.target.value as DiscoveryChannel}))}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                {Object.values(DiscoveryChannel).map(channel => (
                                    <option key={channel} value={channel}>{channel}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-md font-semibold text-text-primary mb-2">4. هل دي أول مرة تزورنا؟</label>
                            <div className="flex items-center space-x-4 space-x-reverse pt-2">
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        name="isFirstVisit" 
                                        checked={impressionData.isFirstVisit === true}
                                        onChange={() => setImpressionData(p => ({...p, isFirstVisit: true}))}
                                        className="ml-2"
                                    />
                                    نعم
                                </label>
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        name="isFirstVisit" 
                                        checked={impressionData.isFirstVisit === false}
                                        onChange={() => setImpressionData(p => ({...p, isFirstVisit: false}))}
                                        className="ml-2"
                                    />
                                    لا
                                </label>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label className="block text-md font-semibold text-text-primary mb-2">ربط بفواتير (اختياري)</label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2 bg-gray-50">
                            {customer.log.length > 0 ? (
                                customer.log.map(entry => (
                                    <label key={entry.invoiceId} className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(impressionData.relatedInvoiceIds || []).includes(entry.invoiceId)}
                                            onChange={() => handleInvoiceSelection(entry.invoiceId)}
                                            className="ml-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <div className="text-sm">
                                            <span className="font-semibold text-text-primary">{entry.invoiceId}</span> - <span className="text-text-secondary">{new Date(entry.date).toLocaleDateString('ar-EG')}</span>
                                            <p className="text-xs text-gray-500">{entry.details}</p>
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center p-2">لا توجد فواتير لهذا العميل.</p>
                            )}
                        </div>
                     </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        إلغاء
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">
                        حفظ الانطباع
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImpressionModal;