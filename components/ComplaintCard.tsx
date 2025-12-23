

import React from 'react';
import { Complaint, User, ComplaintPriority } from '../types';

interface ComplaintCardProps {
    complaint: Complaint;
    user?: User;
    onClick: () => void;
    onViewCustomer: (customerId: string) => void;
}

const priorityStyles: Record<ComplaintPriority, { border: string, text: string }> = {
    [ComplaintPriority.Urgent]: { border: 'border-red-500', text: 'text-red-600' },
    [ComplaintPriority.Medium]: { border: 'border-yellow-500', text: 'text-yellow-600' },
    [ComplaintPriority.Normal]: { border: 'border-gray-300', text: 'text-gray-500' },
};

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, user, onClick, onViewCustomer }) => {
    const styles = priorityStyles[complaint.priority];

    const handleNameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onViewCustomer(complaint.customerId);
    };

    return (
        <div 
            className={`bg-white rounded-lg shadow p-4 border-r-4 ${styles.border} cursor-pointer hover:shadow-lg transition-shadow`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div className="w-2/3">
                    <button onClick={handleNameClick} className="font-bold text-sm text-link hover:underline text-right block w-full truncate">
                        {complaint.customerName}
                    </button>
                    <p className="text-xs text-text-secondary truncate" title={complaint.type}>{complaint.type}</p>
                </div>
                <span className="text-xs font-mono text-gray-400">{complaint.complaintId}</span>
            </div>
            <div className="mt-3 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                    <span>{user?.name || 'غير معين'}</span>
                </div>
                 <div className="text-xs text-gray-500 font-semibold">
                    {new Date(complaint.dateOpened).toLocaleDateString('ar-EG', {day: 'numeric', month: 'short'})}
                </div>
            </div>
        </div>
    );
};

export default ComplaintCard;