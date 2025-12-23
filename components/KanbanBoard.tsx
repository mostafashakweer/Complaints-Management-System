

import React from 'react';
import { Complaint, User, ComplaintStatus } from '../types';
import ComplaintCard from './ComplaintCard';

interface KanbanBoardProps {
    complaints: Complaint[];
    users: User[];
    onCardClick: (complaint: Complaint) => void;
    onViewCustomer: (customerId: string) => void;
}

const statusOrder: ComplaintStatus[] = [
    ComplaintStatus.Open,
    ComplaintStatus.InProgress,
    ComplaintStatus.PendingCustomer,
    ComplaintStatus.Escalated,
    ComplaintStatus.Resolved,
];

const statusStyles: Record<ComplaintStatus, { bg: string, text: string }> = {
    [ComplaintStatus.Open]: { bg: 'bg-badge-info-bg', text: 'text-badge-info-text' },
    [ComplaintStatus.InProgress]: { bg: 'bg-badge-warning-bg', text: 'text-badge-warning-text' },
    [ComplaintStatus.PendingCustomer]: { bg: 'bg-badge-pending-bg', text: 'text-badge-pending-text' },
    [ComplaintStatus.Resolved]: { bg: 'bg-badge-success-bg', text: 'text-badge-success-text' },
    [ComplaintStatus.Escalated]: { bg: 'bg-badge-danger-bg', text: 'text-badge-danger-text' },
};


const KanbanBoard: React.FC<KanbanBoardProps> = ({ complaints, users, onCardClick, onViewCustomer }) => {
    
    const complaintsByStatus = (status: ComplaintStatus) => {
        return complaints.filter(c => c.status === status);
    };

    return (
        <div className="flex space-x-4 space-x-reverse overflow-x-auto pb-4">
            {statusOrder.map(status => {
                const filtered = complaintsByStatus(status);
                const styles = statusStyles[status];

                return (
                    <div key={status} className="w-80 bg-background-muted rounded-lg flex-shrink-0">
                        <div className={`p-3 font-semibold rounded-t-lg flex justify-between items-center ${styles.bg} ${styles.text}`}>
                           <span>{status}</span>
                           <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-white bg-opacity-50">{filtered.length}</span>
                        </div>
                        <div className="p-3 space-y-3 h-full overflow-y-auto" style={{maxHeight: 'calc(100vh - 250px)'}}>
                            {filtered.map(complaint => (
                                <ComplaintCard
                                    key={complaint.complaintId}
                                    complaint={complaint}
                                    user={users.find(u => u.id === complaint.assignedTo)}
                                    onClick={() => onCardClick(complaint)}
                                    onViewCustomer={onViewCustomer}
                                />
                            ))}
                            {filtered.length === 0 && <p className="text-center text-sm text-gray-500 pt-4">لا توجد شكاوى هنا.</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanbanBoard;