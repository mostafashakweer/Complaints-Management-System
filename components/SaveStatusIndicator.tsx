
import React from 'react';
import { CheckIcon, SyncIcon, WarningIcon } from './icons';

type SaveStatus = 'unsaved' | 'saving' | 'saved' | 'error';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status }) => {
    const baseClasses = "flex items-center text-sm transition-opacity duration-300";
    const statusConfig = {
        saving: {
            icon: <SyncIcon className="w-4 h-4 ml-2 animate-spin" />,
            text: 'جاري الحفظ...',
            className: 'text-text-secondary animate-pulse'
        },
        saved: {
            icon: <CheckIcon className="w-4 h-4 ml-2" />,
            text: 'تم حفظ كل التغييرات',
            className: 'text-green-600'
        },
        error: {
            icon: <WarningIcon className="w-4 h-4 ml-2" />,
            text: 'فشل حفظ البيانات.',
            className: 'text-danger'
        },
        unsaved: {
            icon: <WarningIcon className="w-4 h-4 ml-2" />,
            text: 'تغييرات غير محفوظة',
            className: 'text-yellow-600'
        }
    };

    if (!status || !statusConfig[status]) return <div style={{ minWidth: '150px' }} />;

    const { icon, text, className } = statusConfig[status];

    return (
        <div className={`${baseClasses} ${className}`} aria-live="polite" style={{ minWidth: '150px' }}>
            {icon}
            <span>{text}</span>
        </div>
    );
};

export default SaveStatusIndicator;
