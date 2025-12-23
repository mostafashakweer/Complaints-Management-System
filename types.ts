

export interface ComplaintLogEntry {
  user: string;
  date: string;
  action: string;
}

export enum ComplaintStatus {
  Open = 'مفتوحة',
  InProgress = 'قيد المراجعة',
  PendingCustomer = 'في انتظار رد العميل',
  Resolved = 'تم الحل',
  Escalated = 'مُصعَّدة',
}

export enum ComplaintPriority {
  Normal = 'عادية',
  Medium = 'متوسطة',
  Urgent = 'عاجلة',
}

export enum ComplaintChannel {
  Facebook = 'فيسبوك',
  WhatsApp = 'واتساب',
  Phone = 'هاتف',
  Email = 'بريد إلكتروني',
  Website = 'الموقع الإلكتروني',
}

export interface Complaint {
  complaintId: string;
  customerId: string;
  customerName: string;
  dateOpened: string;
  channel: ComplaintChannel;
  type: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  description: string;
  assignedTo?: string;
  resolutionNotes: string;
  dateClosed: string | null;
  log: ComplaintLogEntry[];
  productId?: string;
  productColor?: string;
  productSize?: string;
  attachments?: string[]; // Array of base64 strings
  lastModified: string;
}

export enum CustomerType {
    Normal = 'عادي',
    Corporate = 'شركة',
}

export enum CustomerClassification {
    Bronze = 'برونزي',
    Silver = 'فضي',
    Gold = 'ذهبي',
    Platinum = 'بلاتيني',
}

export enum OrderStatus {
    Processing = 'قيد التجهيز',
    Shipped = 'تم الشحن',
    Delivered = 'تم التسليم',
    Cancelled = 'ملغي'
}

export interface CustomerLogEntry {
    invoiceId: string;
    date: string;
    details: string;
    status: OrderStatus;
    feedback: number | null; // 1-5 stars
    pointsChange: number;
    amount: number;
}

export enum DiscoveryChannel {
    Facebook = 'فيسبوك',
    WhatsApp = 'واتساب',
    Instagram = 'انستاجرام',
    TikTok = 'تيكتوك',
    NearHome = 'قريب من البيت',
    Friends = 'من الأصدقاء',
    Other = 'أخرى'
}

export interface CustomerImpression {
    id: string;
    date: string;
    recordedByUserId: string;
    recordedByUserName: string;
    productQualityRating: number; // 1-5
    productQualityNotes?: string;
    branchExperienceRating: number; // 1-5
    branchExperienceNotes?: string;
    discoveryChannel: DiscoveryChannel;
    isFirstVisit: boolean;
    relatedInvoiceIds?: string[];
    branchId: string; // New
    visitTime?: string; // New
}


export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  joinDate: string;
  type: CustomerType;
  governorate: string;
  streetAddress?: string;
  classification: CustomerClassification;
  points: number; // Available points
  totalPurchases: number; // Total spending amount
  lastPurchaseDate: string | null;
  hasBadReputation?: boolean;
  source?: 'Facebook' | 'Website' | 'Store';
  totalPointsEarned: number;
  totalPointsUsed: number;
  purchaseCount: number;
  log: CustomerLogEntry[];
  impressions?: CustomerImpression[];
  primaryBranchId?: string; // New
  lastModified: string;
}

export enum UserRole {
  Staff = 'موظف',
  Moderator = 'موديريتور',
  TeamLeader = 'تيم ليدر',
  AccountsManager = 'مدير حسابات',
  GeneralManager = 'مدير عام',
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  phone?: string;
  email?: string;
  lastModified: string;
}

// --- New Inventory Management Types ---
export interface ProductStock {
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface ProductVariation {
  id: string;
  colorName: string;
  image: string; // base64 data URL
  stock: ProductStock;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  cost: number;
  points: number;
  alertLimit: number;
  variations: ProductVariation[];
  lastModified: string;
}
// --- End New Inventory Management Types ---


export interface ClassificationSettings {
  silver: number;
  gold: number;
  platinum: number;
}

export interface SystemSettings {
  pointValue: number;
  importSpend: number;
  importPoints: number;
  classification: ClassificationSettings;
  companyName: string;
  companyLogo: string; // base64 data URL
  systemEmail?: string;
  emailJsServiceId?: string;
  emailJsTemplateId?: string;
  emailJsPublicKey?: string;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName:string;
  timestamp: string;
  type: 'LOGIN' | 'LOGOUT' | 'ACTION';
  details: string;
  duration?: number; // in seconds
}

export interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    danger: string;
    warning: string;
    info: string;
    accent2: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    sidebarBackground: string;
    sidebarText: string;
    sidebarActiveBackground: string;
    sidebarLinkText: string;
    badgeSuccessBg: string;
    badgeSuccessText: string;
    badgeWarningBg: string;
    badgeWarningText: string;
    badgeDangerBg: string;
    badgeDangerText: string;
    badgeInfoBg: string;
    badgeInfoText: string;
    badgeMutedBg: string;
    badgeMutedText: string;
    border: string;
    backgroundMuted: string;
    tableHeaderBg: string;
    tableHeaderText: string;
    link: string;
    textDisabled: string;
    badgeGoldBg: string;
    badgeGoldText: string;
    badgePendingBg: string;
    badgePendingText: string;
  };
  font: string;
}

export type Page = 'dashboard' | 'managerDashboard' | 'complaints' | 'customers' | 'reports' | 'settings' | 'products' | 'activityLog' | 'dailyInquiries' | 'users' | 'branches' | 'followUp' | 'dailyFeedback';

export interface DailyInquiry {
  id: string;
  userId: string;
  userName: string;
  date: string;
  productInquiry: string;
  customerGovernorate: string;
  lastModified: string;
}

// --- New Branch Management Types ---
export interface Branch {
  id: string;
  name: string;
  location?: string;
  lastModified: string;
}

export enum FollowUpStatus {
    Pending = 'معلقة',
    Done = 'تمت',
}

export interface FollowUpTask {
    id: string;
    customerId: string;
    customerName: string;
    dateCreated: string;
    reason: string;
    details: string;
    status: FollowUpStatus;
    assignedTo?: string;
    resolutionNotes?: string;
    lastModified: string;
}
// --- End New Branch Management Types ---

// --- New Daily Feedback Types ---
export enum DailyFeedbackStatus {
    Pending = 'معلق',
    Completed = 'مكتمل',
}

export interface DailyFeedbackTask {
    id: string;
    customerId: string;
    customerName: string;
    invoiceId: string;
    invoiceDate: string;
    status: DailyFeedbackStatus;
    lastModified: string;
}
// --- End Daily Feedback Types ---


export interface AppState {
  users: User[];
  customers: Customer[];
  complaints: Complaint[];
  products: Product[];
  dailyInquiries: DailyInquiry[];
  systemSettings: SystemSettings;
  theme: ThemeSettings;
  activityLog: ActivityLogEntry[];
  branches: Branch[]; // New
  followUpTasks: FollowUpTask[]; // New
  dailyFeedbackTasks: DailyFeedbackTask[]; // New
}