
import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: Record<ComplaintStatus, string> = {
    [ComplaintStatus.Open]: 'bg-badge-info-bg text-badge-info-text',
    [ComplaintStatus.InProgress]: 'bg-badge-warning-bg text-badge-warning-text',
    [ComplaintStatus.PendingCustomer]: 'bg-badge-muted-bg text-badge-muted-text',
    [ComplaintStatus.Resolved]: 'bg-badge-success-bg text-badge-success-text',
    [ComplaintStatus.Escalated]: 'bg-badge-danger-bg text-badge-danger-text',
  };

  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;