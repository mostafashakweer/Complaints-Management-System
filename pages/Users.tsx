
import React, { useMemo } from 'react';
import { User, Complaint, ComplaintStatus, UserRole } from '../types';

interface UserCardProps {
    user: User;
    stats: {
        resolved: number;
        inProgress: number;
        avgResolutionTime: string;
    };
}

const UserCard: React.FC<UserCardProps> = ({ user, stats }) => {
    return (
        <div className="bg-surface rounded-lg shadow-md p-6 flex flex-col items-center text-center border-t-4 border-primary">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-primary text-4xl font-bold mb-4">
                {user.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-text-primary">{user.name}</h3>
            <p className="text-text-secondary mb-4">{user.role}</p>
            <div className="w-full border-t pt-4 grid grid-cols-3 gap-2 text-sm">
                <div>
                    <p className="font-bold text-lg text-accent">{stats.resolved}</p>
                    <p className="text-text-secondary">تم حلها</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-warning">{stats.inProgress}</p>
                    <p className="text-text-secondary">قيد المراجعة</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-info">{stats.avgResolutionTime}</p>
                    <p className="text-text-secondary">متوسط الحل</p>
                </div>
            </div>
        </div>
    );
};

interface UsersPageProps {
    users: User[];
    complaints: Complaint[];
}

const UsersPage: React.FC<UsersPageProps> = ({ users, complaints }) => {
    
    const userStats = useMemo(() => {
        return users.map(user => {
            const assigned = complaints.filter(c => c.assignedTo === user.id);
            const resolved = assigned.filter(c => c.status === ComplaintStatus.Resolved);
            const inProgress = assigned.filter(c => c.status === ComplaintStatus.InProgress).length;

            const totalTime = resolved.reduce((acc, c) => {
                if (c.dateClosed && c.dateOpened) {
                    return acc + (new Date(c.dateClosed).getTime() - new Date(c.dateOpened).getTime());
                }
                return acc;
            }, 0);

            const avgTimeMs = resolved.length > 0 ? totalTime / resolved.length : 0;
            const avgHours = (avgTimeMs / (1000 * 60 * 60)).toFixed(1);
            
            return {
                userId: user.id,
                stats: {
                    resolved: resolved.length,
                    inProgress,
                    avgResolutionTime: resolved.length > 0 ? `${avgHours} س` : 'N/A',
                }
            };
        });
    }, [users, complaints]);

    const displayableUsers = users.filter(u => ![UserRole.GeneralManager, UserRole.AccountsManager].includes(u.role));

    return (
        <div>
            <h1 className="text-3xl font-bold text-text-primary mb-6">ملفات الموظفين</h1>
            {displayableUsers.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayableUsers.map(user => {
                            const stats = userStats.find(s => s.userId === user.id)?.stats;
                            return stats ? <UserCard key={user.id} user={user} stats={stats} /> : null;
                        })}
                </div>
            ) : (
                <div className="text-center py-16 bg-surface rounded-lg shadow-md">
                    <p className="text-text-secondary">لا يوجد موظفين لعرضهم في هذه القائمة.</p>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
