import React, { useState } from 'react';
import { User, Complaint, Customer, UserRole, OrderStatus, CustomerType, CustomerClassification, CustomerLogEntry, ClassificationSettings, ThemeSettings, SystemSettings, DailyInquiry, ActivityLogEntry, Branch } from '../types';
import { mockComplaintTypes as initialComplaintTypes } from '../services/mockData';
import UserModal from '../components/UserModal';
import { PlusIcon, ChevronDownIcon, PencilIcon, TrashIcon } from '../components/icons';
import CsvImportModal from '../components/CsvImportModal';
import BranchModal from '../components/BranchModal';

interface SettingsProps {
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  setActivePage: (page: 'products') => void;
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  logUserAction: (details: string) => void;
  theme: ThemeSettings;
  setTheme: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  defaultTheme: ThemeSettings;
  setDailyInquiries: React.Dispatch<React.SetStateAction<DailyInquiry[]>>;
  setActivityLog: React.Dispatch<React.SetStateAction<ActivityLogEntry[]>>;
}

const AccordionCard: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface rounded-lg shadow-md mb-6 overflow-hidden border border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-right p-4 font-bold text-lg text-text-primary bg-background-muted hover:bg-gray-200 transition-colors"
      >
        <span>{title}</span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

const getNextCustomerId = (customers: Customer[]): string => {
    const maxIdNum = customers.reduce((max, c) => {
        const idPart = c.id.split('-')[1];
        const idNum = parseInt(idPart, 10);
        return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);
    return `CUST-${String(maxIdNum + 1).padStart(4, '0')}`;
};

const getClassificationBySpending = (totalPurchases: number, settings: ClassificationSettings): CustomerClassification => {
  if (totalPurchases >= settings.platinum) return CustomerClassification.Platinum;
  if (totalPurchases >= settings.gold) return CustomerClassification.Gold;
  if (totalPurchases >= settings.silver) return CustomerClassification.Silver;
  return CustomerClassification.Bronze;
};


const Settings: React.FC<SettingsProps> = ({ currentUser, users, setUsers, customers, setCustomers, complaints, setComplaints, branches, setBranches, setActivePage, systemSettings, setSystemSettings, logUserAction, theme, setTheme, defaultTheme, setDailyInquiries, setActivityLog }) => {
  const [complaintTypes, setComplaintTypes] = useState<string[]>(initialComplaintTypes);
  const [newType, setNewType] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);
  const [importModalState, setImportModalState] = useState<{
    isOpen: boolean;
    headers: string[];
    data: { [key: string]: string }[];
  }>({ isOpen: false, headers: [], data: [] });

  // --- Permissions ---
  const isManager = currentUser.role === UserRole.GeneralManager;
  const isAccountsManager = currentUser.role === UserRole.AccountsManager;
  const isTeamLeader = currentUser.role === UserRole.TeamLeader;
  const isStaff = currentUser.role === UserRole.Staff;
  const isModerator = currentUser.role === UserRole.Moderator;

  const canAccessDataManagement = isManager || isAccountsManager || isModerator || isTeamLeader || isStaff;
  const canAccessComplaintTypes = isManager || isAccountsManager || isModerator || isTeamLeader || isStaff;
  const canAccessBranches = isManager || isAccountsManager || isModerator || isTeamLeader || isStaff;
  
  const canAccessProducts = isManager || isAccountsManager || isModerator;
  
  const canAccessCompanyInfo = isManager || isAccountsManager;
  const canAccessEmailSettings = isManager || isAccountsManager;
  const canAccessTheme = isManager || isAccountsManager;
  const canAccessClassification = isManager || isAccountsManager;
  const canAccessPoints = isManager || isAccountsManager;
  const canAccessUsers = isManager || isAccountsManager;
  
  const hasAnySettingsAccess = [canAccessProducts, canAccessBranches, canAccessComplaintTypes, canAccessDataManagement, canAccessCompanyInfo, canAccessEmailSettings, canAccessTheme, canAccessClassification, canAccessPoints, canAccessUsers].some(Boolean);
  // --- End Permissions ---


  const colorMappings: { key: keyof ThemeSettings['colors']; label: string; group: string }[] = [
    // Basic
    { key: 'primary', label: 'اللون الأساسي', group: 'أساسي' },
    { key: 'secondary', label: 'اللون الثانوي', group: 'أساسي' },
    { key: 'accent', label: 'لون التمييز (Success)', group: 'أساسي' },
    { key: 'accent2', label: 'لون التمييز 2 (Voucher)', group: 'أساسي' },
    { key: 'danger', label: 'لون الخطر', group: 'أساسي' },
    { key: 'warning', label: 'لون التحذير', group: 'أساسي' },
    { key: 'info', label: 'لون المعلومات', group: 'أساسي' },
    { key: 'link', label: 'لون الروابط', group: 'أساسي' },
     // Background
    { key: 'background', label: 'خلفية التطبيق', group: 'الخلفيات والنصوص' },
    { key: 'surface', label: 'خلفية البطاقات', group: 'الخلفيات والنصوص' },
    { key: 'backgroundMuted', label: 'خلفية ثانوية', group: 'الخلفيات والنصوص' },
    { key: 'border', label: 'لون الحدود', group: 'الخلفيات والنصوص' },
    // Text
    { key: 'textPrimary', label: 'النص الأساسي', group: 'الخلفيات والنصوص' },
    { key: 'textSecondary', label: 'النص الثانوي', group: 'الخلفيات والنصوص' },
    { key: 'textDisabled', label: 'النص المعطل', group: 'الخلفيات والنصوص' },
    // Sidebar
    { key: 'sidebarBackground', label: 'خلفية الشريط', group: 'شريط جانبي' },
    { key: 'sidebarText', label: 'نص الشريط', group: 'شريط جانبي' },
    { key: 'sidebarActiveBackground', label: 'خلفية العنصر النشط', group: 'شريط جانبي' },
    { key: 'sidebarLinkText', label: 'نص الرابط', group: 'شريط جانبي' },
    // Badges
    { key: 'badgeSuccessBg', label: 'خلفية (نجاح)', group: 'شارات الحالة' },
    { key: 'badgeSuccessText', label: 'نص (نجاح)', group: 'شارات الحالة' },
    { key: 'badgeWarningBg', label: 'خلفية (تحذير)', group: 'شارات الحالة' },
    { key: 'badgeWarningText', label: 'نص (تحذير)', group: 'شارات الحالة' },
    { key: 'badgeDangerBg', label: 'خلفية (خطر)', group: 'شارات الحالة' },
    { key: 'badgeDangerText', label: 'نص (خطر)', group: 'شارات الحالة' },
    { key: 'badgeInfoBg', label: 'خلفية (معلومات)', group: 'شارات الحالة' },
    { key: 'badgeInfoText', label: 'نص (معلومات)', group: 'شارات الحالة' },
    { key: 'badgeMutedBg', label: 'خلفية (محايد)', group: 'شارات الحالة' },
    { key: 'badgeMutedText', label: 'نص (محايد)', group: 'شارات الحالة' },
    { key: 'badgePendingBg', label: 'خلفية (انتظار)', group: 'شارات الحالة' },
    { key: 'badgePendingText', label: 'نص (انتظار)', group: 'شارات الحالة' },
    { key: 'badgeGoldBg', label: 'خلفية (ذهبي)', group: 'شارات التصنيف' },
    { key: 'badgeGoldText', label: 'نص (ذهبي)', group: 'شارات التصنيف' },
     // Tables
    { key: 'tableHeaderBg', label: 'خلفية رأس الجدول', group: 'الجداول' },
    { key: 'tableHeaderText', label: 'نص رأس الجدول', group: 'الجداول' },
  ];
  const colorGroups = [...new Set(colorMappings.map(c => c.group))];

  const fontOptions = ['Tajawal', 'Cairo', 'Almarai', 'Noto Sans Arabic', 'Readex Pro'];

  const handleAddType = () => {
    if (newType && !complaintTypes.includes(newType)) {
      setComplaintTypes([...complaintTypes, newType]);
      logUserAction(`إضافة نوع شكوى جديد: ${newType}.`);
      setNewType('');
    }
  };

  const handleDeleteType = (typeToDelete: string) => {
    setComplaintTypes(complaintTypes.filter(type => type !== typeToDelete));
    logUserAction(`حذف نوع الشكوى: ${typeToDelete}.`);
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSystemSettings(prev => ({ ...prev, companyLogo: reader.result as string }));
        logUserAction('تم تحديث شعار الشركة.');
      };
      reader.readAsDataURL(file);
    } else {
        alert('الرجاء اختيار ملف صورة صحيح.');
    }
  };

  const parseCsv = (text: string): { headers: string[], data: { [key: string]: string }[] } => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const entry: { [key: string]: string } = {};
        headers.forEach((header, index) => {
            entry[header] = values[index];
        });
        return entry;
    });
    return { headers, data };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const { headers, data } = parseCsv(text);
          setImportModalState({ isOpen: true, headers, data });
        }
      };
      reader.readAsText(file, 'UTF-8');
      event.target.value = '';
    }
  };
  
  const handleProcessImport = (mapping: { [key: string]: string }) => {
    const customersCopy = JSON.parse(JSON.stringify(customers)) as Customer[];
    let newCustomersCount = 0;
    let updatedCustomersCount = 0;
    let newTransactionsCount = 0;
    let skippedRows = 0;

    const customerIdMap = new Map(customersCopy.map(c => [c.id, c]));
    const customerPhoneMap = new Map(customersCopy.map(c => [c.phone, c]));
    
    importModalState.data.forEach(row => {
        const importedData: { [key: string]: any } = {};
        for (const csvHeader in mapping) {
            if (mapping[csvHeader]) importedData[mapping[csvHeader]] = row[csvHeader];
        }

        if (!importedData.id && !importedData.phone) {
            skippedRows++;
            return;
        }
        
        let customer: Customer | undefined;
        let isNewCustomer = false;

        // Find customer
        if (importedData.id) customer = customerIdMap.get(importedData.id);
        if (!customer && importedData.phone) customer = customerPhoneMap.get(importedData.phone);
        
        // Create new customer if not found
        if (!customer) {
            if (!importedData.phone || !importedData.name) {
                skippedRows++;
                return;
            }
            const newCustomerId = importedData.id || getNextCustomerId(Array.from(customerIdMap.values()));
            if (customerIdMap.has(newCustomerId)) {
                skippedRows++;
                return;
            }
            isNewCustomer = true;
            customer = {
                id: newCustomerId,
                phone: importedData.phone,
                name: importedData.name,
                governorate: importedData.governorate || 'N/A',
                joinDate: new Date().toISOString(),
                type: CustomerType.Normal,
                classification: CustomerClassification.Bronze,
                points: 0,
                totalPurchases: 0,
                lastPurchaseDate: null,
                totalPointsEarned: 0,
                totalPointsUsed: 0,
                purchaseCount: 0,
                log: [],
                lastModified: new Date().toISOString(),
            };
        }
        
        // Update customer info if provided
        if (!isNewCustomer) {
            if (importedData.name) customer.name = importedData.name;
            if (importedData.governorate) customer.governorate = importedData.governorate;
            if (importedData.streetAddress) customer.streetAddress = importedData.streetAddress;
            if (importedData.email) customer.email = importedData.email;
        }

        // Process transaction if invoiceId is present
        if (importedData.invoiceId && !customer.log.some(l => l.invoiceId === importedData.invoiceId)) {
            const amount = parseFloat(importedData.invoiceAmount) || 0;
            const pointsChange = Math.floor(amount / systemSettings.importSpend) * systemSettings.importPoints;
            const newLog: CustomerLogEntry = {
                invoiceId: importedData.invoiceId,
                date: importedData.invoiceDate ? new Date(importedData.invoiceDate).toISOString() : new Date().toISOString(),
                details: importedData.invoiceDetails || 'عملية شراء مستوردة',
                status: OrderStatus.Delivered,
                feedback: null,
                amount,
                pointsChange,
            };
            customer.log.push(newLog);
            customer.totalPurchases += amount;
            customer.points += pointsChange;
            customer.totalPointsEarned += pointsChange;
            customer.purchaseCount++;
            newTransactionsCount++;
        }
        
        // Process summary data
        if (importedData._oldTotalPurchases) {
            customer.totalPurchases += parseFloat(importedData._oldTotalPurchases);
        }
        if (importedData._oldPoints) {
            const oldPoints = parseInt(importedData._oldPoints, 10);
            customer.points += oldPoints;
            customer.totalPointsEarned += oldPoints;
        }
        
        // Recalculate last purchase date and classification
        if (customer.log.length > 0) {
            customer.log.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            customer.lastPurchaseDate = customer.log[0].date;
        }
        customer.classification = getClassificationBySpending(customer.totalPurchases, systemSettings.classification);

        if (isNewCustomer) {
            customerIdMap.set(customer.id, customer);
            customerPhoneMap.set(customer.phone, customer);
            newCustomersCount++;
        } else {
            updatedCustomersCount++;
        }
    });

    setCustomers(Array.from(customerIdMap.values()));
    setImportModalState({ isOpen: false, headers: [], data: [] });
    logUserAction(`استيراد بيانات من CSV: ${newCustomersCount} عملاء جدد, ${updatedCustomersCount} تم تحديثهم, ${newTransactionsCount} معاملات جديدة.`);
    alert(`اكتمل الاستيراد!
    - عملاء جدد: ${newCustomersCount}
    - عملاء تم تحديثهم: ${updatedCustomersCount}
    - معاملات جديدة: ${newTransactionsCount}
    - صفوف تم تخطيها (بيانات ناقصة): ${skippedRows}`);
  };

  const handleClearData = (type: 'customers' | 'complaints' | 'all') => {
    let confirmationMessage = '';
    switch (type) {
      case 'customers':
        confirmationMessage = 'هل أنت متأكد أنك تريد حذف جميع العملاء وسجلاتهم؟ هذا الإجراء لا يمكن التراجع عنه.';
        break;
      case 'complaints':
        confirmationMessage = 'هل أنت متأكد أنك تريد حذف جميع الشكاوى؟ هذا الإجراء لا يمكن التراجع عنه.';
        break;
      case 'all':
        confirmationMessage = 'تحذير خطير! هل أنت متأكد أنك تريد حذف جميع البيانات في النظام (عملاء، شكاوى، سجلات)؟ هذا الإجراء لا يمكن التراجع عنه.';
        break;
    }

    if (window.confirm(confirmationMessage)) {
      if (type === 'customers' || type === 'all') {
        setCustomers([]);
        logUserAction('حذف جميع بيانات العملاء.');
      }
      if (type === 'complaints' || type === 'all') {
        setComplaints([]);
        logUserAction('حذف جميع بيانات الشكاوى.');
      }
      if (type === 'all') {
        setDailyInquiries([]);
        setActivityLog([]);
      }
      alert('تم حذف البيانات المحددة.');
    }
  };
  
  const handleSaveUser = (user: User) => {
    let finalUser = { ...user, lastModified: new Date().toISOString() };

    // Handle password update for existing user
    if (userToEdit && !finalUser.password) {
        const existingUser = users.find(u => u.id === userToEdit.id);
        finalUser.password = existingUser?.password || '';
    }

    const isEditing = users.some(u => u.id === finalUser.id);
    if (isEditing) {
        setUsers(users.map(u => u.id === finalUser.id ? finalUser : u));
        logUserAction(`تحديث بيانات الموظف: ${finalUser.name}.`);
    } else {
        setUsers([finalUser, ...users]);
        logUserAction(`إضافة موظف جديد: ${finalUser.name}.`);
    }
    setIsUserModalOpen(false);
    setUserToEdit(null);
  };
  
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
        alert("لا يمكنك حذف حسابك الخاص.");
        return;
    }
    if (window.confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
        const userName = users.find(u => u.id === userId)?.name;
        setUsers(users.filter(u => u.id !== userId));
        logUserAction(`حذف الموظف: ${userName}.`);
    }
  };

  const handleSaveBranch = (branch: Branch) => {
    const finalBranch = { ...branch, lastModified: new Date().toISOString() };
    const isEditing = branches.some(b => b.id === finalBranch.id);
    if (isEditing) {
      setBranches(branches.map(b => b.id === finalBranch.id ? finalBranch : b));
      logUserAction(`تحديث بيانات الفرع: ${finalBranch.name}.`);
    } else {
      setBranches([finalBranch, ...branches]);
      logUserAction(`إضافة فرع جديد: ${finalBranch.name}.`);
    }
    setIsBranchModalOpen(false);
    setBranchToEdit(null);
  };
  
  const handleDeleteBranch = (branchId: string) => {
     if (window.confirm("هل أنت متأكد من حذف هذا الفرع؟")) {
        const branchName = branches.find(b => b.id === branchId)?.name;
        setBranches(branches.filter(b => b.id !== branchId));
        logUserAction(`حذف الفرع: ${branchName}.`);
    }
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>, section?: keyof SystemSettings) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) : value;

    if (section) {
        setSystemSettings(prev => ({
            ...prev,
            [section]: {
                // @ts-ignore
                ...prev[section],
                [name]: parsedValue,
            }
        }));
    } else {
        setSystemSettings(prev => ({
            ...prev,
            [name]: parsedValue
        }));
    }
  };
  
  const handleThemeColorChange = (key: keyof ThemeSettings['colors'], value: string) => {
    setTheme(prev => ({
        ...prev,
        colors: {
            ...prev.colors,
            [key]: value
        }
    }));
  };

  const handleThemeFontChange = (value: string) => {
    setTheme(prev => ({ ...prev, font: value }));
  };
  
  if (!hasAnySettingsAccess) {
    return (
        <div className="text-center p-8 bg-surface rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-danger mb-4">وصول غير مصرح به</h2>
            <p className="text-text-secondary">
                صلاحياتك الحالية لا تسمح بالوصول إلى صفحة الإعدادات.
            </p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">الإعدادات</h1>
      
      {canAccessDataManagement && (
      <AccordionCard title="إدارة البيانات">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background-muted p-4 rounded-lg border border-border">
                <h4 className="font-bold text-lg mb-2">استيراد بيانات العملاء</h4>
                <p className="text-sm text-text-secondary mb-4">
                  قم برفع ملف CSV يحتوي على بيانات العملاء (جدد أو حاليين) لتحديث قاعدة البيانات. يمكنك إضافة معاملات أو أرصدة قديمة.
                </p>
                <input type="file" accept=".csv" onChange={handleFileSelect} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-danger">
                <h4 className="font-bold text-lg mb-2 text-danger">حذف البيانات</h4>
                <p className="text-sm text-red-700 mb-4">
                  تحذير: هذا الإجراء سيقوم بحذف دائم للبيانات المحددة ولا يمكن التراجع عنه.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={() => handleClearData('customers')} className="w-full bg-red-200 text-danger font-semibold px-4 py-2 rounded-md hover:bg-red-300">حذف العملاء</button>
                    <button onClick={() => handleClearData('complaints')} className="w-full bg-red-200 text-danger font-semibold px-4 py-2 rounded-md hover:bg-red-300">حذف الشكاوى</button>
                    <button onClick={() => handleClearData('all')} className="w-full bg-danger text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">حذف كل شيء</button>
                </div>
            </div>
        </div>
      </AccordionCard>
      )}

      {canAccessComplaintTypes && (
      <AccordionCard title="إدارة أنواع الشكاوى">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold mb-2">الأنواع الحالية</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {complaintTypes.map(type => (
                <div key={type} className="flex justify-between items-center bg-background-muted p-2 rounded">
                  <span>{type}</span>
                  <button onClick={() => handleDeleteType(type)} className="text-danger hover:text-red-700">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-2">إضافة نوع جديد</h4>
            <div className="flex space-x-2 space-x-reverse">
              <input 
                type="text" 
                value={newType} 
                onChange={e => setNewType(e.target.value)}
                className="flex-grow p-2 border border-border rounded-md"
                placeholder="اكتب نوع الشكوى الجديد"
              />
              <button onClick={handleAddType} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800">إضافة</button>
            </div>
          </div>
        </div>
      </AccordionCard>
      )}
      
      {canAccessBranches && (
        <AccordionCard title="إدارة الفروع">
            <button onClick={() => { setBranchToEdit(null); setIsBranchModalOpen(true); }} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-800 mb-4">
                <PlusIcon className="w-5 h-5 ml-2" />
                <span>إضافة فرع جديد</span>
            </button>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
                        <tr>
                            <th className="px-6 py-3">اسم الفرع</th>
                            <th className="px-6 py-3">الموقع</th>
                            <th className="px-6 py-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map(branch => (
                            <tr key={branch.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{branch.name}</td>
                                <td className="px-6 py-4">{branch.location}</td>
                                <td className="px-6 py-4 flex space-x-2 space-x-reverse">
                                    <button onClick={() => { setBranchToEdit(branch); setIsBranchModalOpen(true); }} className="text-info"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeleteBranch(branch.id)} className="text-danger"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AccordionCard>
      )}

      {canAccessProducts && (
      <AccordionCard title="إدارة المنتجات">
        <p className="text-text-secondary mb-4">لإضافة منتجات جديدة أو تعديل المخزون والأسعار، انتقل إلى صفحة إدارة المخزون.</p>
        <button onClick={() => setActivePage('products')} className="bg-accent text-white font-semibold px-6 py-2 rounded-md hover:bg-green-600">
            الانتقال إلى صفحة المخزون
        </button>
      </AccordionCard>
      )}

      {canAccessUsers && (
      <AccordionCard title="إدارة الموظفين والصلاحيات">
        <button onClick={() => { setUserToEdit(null); setIsUserModalOpen(true); }} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-800 mb-4">
          <PlusIcon className="w-5 h-5 ml-2" />
          <span>إضافة موظف</span>
        </button>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-text-secondary">
            <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
              <tr>
                <th className="px-6 py-3">الاسم</th>
                <th className="px-6 py-3">اسم المستخدم</th>
                <th className="px-6 py-3">الدور</th>
                <th className="px-6 py-3">الهاتف</th>
                <th className="px-6 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-text-primary">{user.name}</td>
                  <td className="px-6 py-4">{user.username}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 flex space-x-2 space-x-reverse">
                    <button onClick={() => { setUserToEdit(user); setIsUserModalOpen(true); }} className="text-info"><PencilIcon className="w-5 h-5"/></button>
                    {user.id !== currentUser.id && <button onClick={() => handleDeleteUser(user.id)} className="text-danger"><TrashIcon className="w-5 h-5"/></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionCard>
      )}
      
      {canAccessCompanyInfo && (
        <AccordionCard title="معلومات الشركة الأساسية">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">اسم الشركة</label>
                    <input type="text" name="companyName" value={systemSettings.companyName} onChange={handleSettingChange} className="w-full p-2 border border-border rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">شعار الشركة</label>
                    <div className="flex items-center gap-4">
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
                        {systemSettings.companyLogo && <img src={systemSettings.companyLogo} alt="logo preview" className="h-12 w-12 object-contain bg-gray-200 rounded-md p-1"/>}
                    </div>
                </div>
            </div>
        </AccordionCard>
      )}
      
      {canAccessEmailSettings && (
        <AccordionCard title="إعدادات البريد الإلكتروني (EmailJS)">
             <p className="text-text-secondary text-sm mb-4">
                تستخدم هذه الإعدادات لإرسال إشعارات تلقائية بالشكاوى العاجلة أو المصعدة. يمكنك الحصول على هذه البيانات من حسابك على <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-link hover:underline">EmailJS</a>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="emailJsServiceId" value={systemSettings.emailJsServiceId || ''} onChange={handleSettingChange} placeholder="Service ID" className="p-2 border rounded"/>
                <input name="emailJsTemplateId" value={systemSettings.emailJsTemplateId || ''} onChange={handleSettingChange} placeholder="Template ID" className="p-2 border rounded"/>
                <input name="emailJsPublicKey" value={systemSettings.emailJsPublicKey || ''} onChange={handleSettingChange} placeholder="Public Key (User ID)" className="p-2 border rounded"/>
            </div>
        </AccordionCard>
      )}
      
      {canAccessClassification && (
        <AccordionCard title="إعدادات تصنيف العملاء">
            <p className="text-text-secondary text-sm mb-4">
                حدد الحد الأدنى من إجمالي المشتريات بالجنيه المصري لكل تصنيف.
            </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">فضي</label>
                    <input type="number" name="silver" value={systemSettings.classification.silver} onChange={(e) => handleSettingChange(e, 'classification')} className="w-full p-2 border border-border rounded-md"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">ذهبي</label>
                    <input type="number" name="gold" value={systemSettings.classification.gold} onChange={(e) => handleSettingChange(e, 'classification')} className="w-full p-2 border border-border rounded-md"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">بلاتيني</label>
                    <input type="number" name="platinum" value={systemSettings.classification.platinum} onChange={(e) => handleSettingChange(e, 'classification')} className="w-full p-2 border border-border rounded-md"/>
                </div>
            </div>
        </AccordionCard>
      )}
      
      {canAccessPoints && (
        <AccordionCard title="إعدادات نظام النقاط">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">قيمة النقطة (جنيه)</label>
                    <input type="number" name="pointValue" value={systemSettings.pointValue} onChange={handleSettingChange} className="w-full p-2 border border-border rounded-md"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">قيمة الشراء للنقاط</label>
                    <input type="number" name="importSpend" value={systemSettings.importSpend} onChange={handleSettingChange} className="w-full p-2 border border-border rounded-md"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">عدد النقاط المكتسبة</label>
                    <input type="number" name="importPoints" value={systemSettings.importPoints} onChange={handleSettingChange} className="w-full p-2 border border-border rounded-md"/>
                </div>
            </div>
             <p className="text-text-secondary text-xs mt-2">
                مثال: يكتسب العميل <span className="font-bold">{systemSettings.importPoints}</span> نقطة مقابل كل <span className="font-bold">{systemSettings.importSpend}</span> جنيه من المشتريات.
            </p>
        </AccordionCard>
      )}

      {canAccessTheme && (
        <AccordionCard title="تخصيص المظهر والألوان">
            <div className="mb-6 pb-4 border-b">
                <h4 className="font-bold mb-2">الخط الأساسي</h4>
                <select value={theme.font} onChange={(e) => handleThemeFontChange(e.target.value)} className="p-2 border border-border rounded-md">
                    {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
            </div>
            {colorGroups.map(group => (
                 <div key={group} className="mb-6">
                     <h4 className="font-bold mb-3">{group}</h4>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                     {colorMappings.filter(c => c.group === group).map(color => (
                        <div key={color.key}>
                            <label className="block text-sm text-text-secondary mb-1">{color.label}</label>
                            <div className="flex items-center gap-2 p-1 border rounded-md">
                                <input
                                    type="color"
                                    value={theme.colors[color.key]}
                                    onChange={(e) => handleThemeColorChange(color.key, e.target.value)}
                                    className="w-8 h-8 rounded border-none cursor-pointer"
                                    style={{'backgroundColor': 'transparent'}}
                                />
                                <span className="text-sm font-mono">{theme.colors[color.key]}</span>
                            </div>
                        </div>
                     ))}
                     </div>
                </div>
            ))}
            <button onClick={() => setTheme(defaultTheme)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                استعادة الألوان الافتراضية
            </button>
        </AccordionCard>
      )}


      <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleSaveUser} userToEdit={userToEdit} />
      <BranchModal isOpen={isBranchModalOpen} onClose={() => setIsBranchModalOpen(false)} onSave={handleSaveBranch} branchToEdit={branchToEdit} />
      <CsvImportModal 
        isOpen={importModalState.isOpen}
        onClose={() => setImportModalState({ isOpen: false, headers: [], data: [] })}
        onImport={handleProcessImport}
        csvHeaders={importModalState.headers}
      />
    </div>
  );
};

export default Settings;