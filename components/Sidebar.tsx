

import React, { useEffect } from 'react';
import { Page, User, UserRole } from '../types';
import { DashboardIcon, ComplaintIcon, CustomerIcon, ReportIcon, SettingsIcon, ProductIcon, ActivityLogIcon, InquiryIcon, UsersIcon, BranchIcon, FollowUpIcon, FeedbackIcon } from './icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  currentUser: User;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, currentUser, isOpen, setIsOpen }) => {
  
  const handleNavigation = (page: Page) => {
    setActivePage(page);
    // Close sidebar on navigation on mobile devices
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };
  
  const getMenuItems = (role: UserRole) => {
    const staffItems = [
      { id: 'dashboard', label: 'لوحة التحكم', icon: DashboardIcon },
      { id: 'complaints', label: 'سجل الشكاوى', icon: ComplaintIcon },
      { id: 'dailyInquiries', label: 'سجل الاستفسارات', icon: InquiryIcon },
      { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
    ];
    
    const moderatorItems = [
      { id: 'complaints', label: 'سجل الشكاوى', icon: ComplaintIcon },
      { id: 'customers', label: 'إدارة العملاء', icon: CustomerIcon },
      { id: 'dailyFeedback', label: 'التقييمات اليومية', icon: FeedbackIcon },
      { id: 'dailyInquiries', label: 'سجل الاستفسارات', icon: InquiryIcon },
      { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
    ];

    const teamLeaderItems = [
      { id: 'dashboard', label: 'لوحة التحكم', icon: DashboardIcon },
      { id: 'complaints', label: 'سجل الشكاوى', icon: ComplaintIcon },
      { id: 'customers', label: 'إدارة العملاء', icon: CustomerIcon },
      { id: 'dailyFeedback', label: 'التقييمات اليومية', icon: FeedbackIcon },
      { id: 'users', label: 'ملفات الموظفين', icon: UsersIcon },
      { id: 'followUp', label: 'مهام المتابعة', icon: FollowUpIcon },
      { id: 'dailyInquiries', label: 'سجل الاستفسارات', icon: InquiryIcon },
      { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
    ];
    
    const accountsManagerItems = [
      { id: 'managerDashboard', label: 'لوحة تحكم المدير', icon: DashboardIcon },
      { id: 'complaints', label: 'سجل الشكاوى', icon: ComplaintIcon },
      { id: 'customers', label: 'إدارة العملاء', icon: CustomerIcon },
      { id: 'dailyFeedback', label: 'التقييمات اليومية', icon: FeedbackIcon },
      { id: 'users', label: 'ملفات الموظفين', icon: UsersIcon },
      { id: 'reports', label: 'التقارير', icon: ReportIcon },
      { id: 'branches', label: 'تقارير الفروع', icon: BranchIcon },
      { id: 'followUp', label: 'مهام المتابعة', icon: FollowUpIcon },
      { id: 'activityLog', label: 'شيت تقارير اليوم', icon: ActivityLogIcon },
      { id: 'products', label: 'المخزون', icon: ProductIcon },
      { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
    ];

    const generalManagerItems = [
      { id: 'managerDashboard', label: 'لوحة تحكم المدير', icon: DashboardIcon },
      { id: 'complaints', label: 'سجل الشكاوى', icon: ComplaintIcon },
      { id: 'customers', label: 'إدارة العملاء', icon: CustomerIcon },
      { id: 'dailyFeedback', label: 'التقييمات اليومية', icon: FeedbackIcon },
      { id: 'users', label: 'ملفات الموظفين', icon: UsersIcon },
      { id: 'reports', label: 'التقارير', icon: ReportIcon },
      { id: 'branches', label: 'تقارير الفروع', icon: BranchIcon },
      { id: 'followUp', label: 'مهام المتابعة', icon: FollowUpIcon },
      { id: 'activityLog', label: 'شيت تقارير اليوم', icon: ActivityLogIcon },
      { id: 'products', label: 'المخزون', icon: ProductIcon },
      { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
    ];

    switch (role) {
      case UserRole.GeneralManager:
        return generalManagerItems;
      case UserRole.AccountsManager:
        return accountsManagerItems;
      case UserRole.TeamLeader:
        return teamLeaderItems;
      case UserRole.Moderator:
        return moderatorItems;
      case UserRole.Staff:
        return staffItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems(currentUser.role);
  
  // Debug: Log user role and menu items to help diagnose empty sidebar
  useEffect(() => {
    console.log("Sidebar - Current user:", currentUser);
    console.log("Sidebar - User role:", currentUser.role);
    console.log("Sidebar - Available roles:", Object.values(UserRole));
    console.log("Sidebar - Menu items count:", menuItems.length);
    console.log("Sidebar - Menu items:", menuItems);
  }, [currentUser, menuItems]);

  return (
    <div className={`w-64 bg-sidebar-background text-sidebar-text p-4 flex flex-col fixed right-0 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 top-8 h-[calc(100vh-2rem)]`}>
      <div className="text-2xl font-bold mb-10 text-center">
        نظام الشكاوى
      </div>
      <nav className="flex-grow">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className="mb-2">
              <button
                onClick={() => handleNavigation(item.id as Page)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors relative ${
                  activePage === item.id
                    ? 'bg-sidebar-active-background'
                    : 'hover:bg-sidebar-active-background/50'
                }`}
              >
                {activePage === item.id && <div className="absolute right-0 top-0 h-full w-1 bg-white rounded-r-full"></div>}
                <item.icon className="w-6 h-6 ml-3" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;