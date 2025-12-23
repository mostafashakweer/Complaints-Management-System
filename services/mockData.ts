

import { User, Customer, Complaint, ComplaintStatus, ComplaintPriority, ComplaintChannel, CustomerType, CustomerClassification, CustomerLogEntry, OrderStatus, Product, UserRole, DailyInquiry, Branch, FollowUpTask, CustomerImpression, DiscoveryChannel, DailyFeedbackTask } from '../types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'محمود', username: 'mahmoud', password: '123', role: UserRole.GeneralManager, phone: '01012345678', email: 'mahmoud@example.com', lastModified: new Date().toISOString() },
  { id: 'user-5', name: 'علي حسن', username: 'accounts', password: 'password5', role: UserRole.AccountsManager, phone: '01112345678', email: 'ali.hassan@example.com', lastModified: new Date().toISOString() },
  { id: 'user-2', name: 'فاطمة علي', username: 'leader', password: 'password2', role: UserRole.TeamLeader, phone: '01212345678', email: 'fatima.ali@example.com', lastModified: new Date().toISOString() },
  { id: 'user-3', name: 'خالد سعيد', username: 'moderator', password: 'password3', role: UserRole.Moderator, phone: '01098765432', email: 'khaled.saeed@example.com', lastModified: new Date().toISOString() },
  { id: 'user-4', name: 'هند رضا', username: 'staff', password: 'password4', role: UserRole.Staff, phone: '01198765432', email: 'hind.reda@example.com', lastModified: new Date().toISOString() },
];

export const mockBranches: Branch[] = [
    { id: 'branch-1', name: 'فرع مدينة نصر', location: 'القاهرة', lastModified: new Date().toISOString() },
    { id: 'branch-2', name: 'فرع التجمع الخامس', location: 'القاهرة', lastModified: new Date().toISOString() },
    { id: 'branch-3', name: 'فرع الإسكندرية', location: 'الإسكندرية', lastModified: new Date().toISOString() },
];

export const mockFollowUpTasks: FollowUpTask[] = [];
export const mockDailyFeedbackTasks: DailyFeedbackTask[] = [];

export const mockProducts: Product[] = [
    {
        id: 'prod-1',
        code: 'TS-001',
        name: 'تيشيرت قطني بريميوم',
        price: 350,
        cost: 120,
        points: 20,
        alertLimit: 10,
        variations: [
            {
                id: 'var-1-1',
                colorName: 'أسود',
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAABb8tAIAAAAXklEQVR4Ae3OMQEAAAwCoNk/tIvhAw4d2AcSgQBAgAABAgQIECAgAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEgQb04AAfG83/AAAAASUVORK5CYII=',
                stock: { M: 15, L: 20, XL: 8, XXL: 5 }
            },
            {
                id: 'var-1-2',
                colorName: 'أبيض',
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAABb8tAIAAAAXklEQVR4Ae3OMQEAIAwDMP99y+0DBk42sHFCgAABAgQIECBAgIAECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAClAABnno6pAAAAABJRU5ErkJggg==',
                stock: { M: 12, L: 18, XL: 10, XXL: 3 }
            }
        ],
        lastModified: new Date().toISOString()
    },
    {
        id: 'prod-2',
        code: 'PN-001',
        name: 'بنطلون جينز بقصة مستقيمة',
        price: 600,
        cost: 250,
        points: 45,
        alertLimit: 5,
        variations: [
            {
                id: 'var-2-1',
                colorName: 'أزرق داكن',
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAABb8tAIAAAAW0lEQVR4Ae3OMQEAIAwDof99y20DBk428HFCgAABAgQIECBAgIAECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEgQbgABfXwA0QAAAABJRU5ErkJggg==',
                stock: { M: 8, L: 10, XL: 4, XXL: 2 }
            }
        ],
        lastModified: new Date().toISOString()
    }
];

const customer1Log: CustomerLogEntry[] = [
    { invoiceId: 'INV-1024', date: '2024-05-15T10:00:00Z', details: 'منتج أ - أزرق - L - 1 قطعة', status: OrderStatus.Delivered, feedback: 5, pointsChange: 500, amount: 5000 },
    { invoiceId: 'INV-1011', date: '2024-03-20T12:30:00Z', details: 'منتج ب - أحمر - M - 2 قطعة', status: OrderStatus.Delivered, feedback: 4, pointsChange: 1000, amount: 10000 },
];

const customer1Impressions: CustomerImpression[] = [
    {
        id: 'imp-1', date: '2024-05-15T11:00:00Z', recordedByUserId: 'user-3', recordedByUserName: 'خالد سعيد',
        productQualityRating: 5, branchExperienceRating: 4, discoveryChannel: DiscoveryChannel.Friends,
        isFirstVisit: false, branchId: 'branch-1', visitTime: '10:30', relatedInvoiceIds: ['INV-1024']
    }
];

const customer3Log: CustomerLogEntry[] = [
     { invoiceId: 'INV-1022', date: '2024-04-28T09:00:00Z', details: 'منتج ج - أخضر - S - 1 قطعة', status: OrderStatus.Delivered, feedback: 5, pointsChange: 250, amount: 2500 },
];


export const mockCustomers: Customer[] = [
  { 
    id: 'CUST-0001', name: 'شركة النور', phone: '0501234567', email: 'contact@alnoor.com', joinDate: '2023-01-15', 
    type: CustomerType.Corporate, governorate: 'الرياض', streetAddress: 'طريق الملك فهد',
    classification: CustomerClassification.Gold, 
    points: 1250, totalPointsEarned: 1500, totalPointsUsed: 250,
    totalPurchases: 15000, purchaseCount: 2, lastPurchaseDate: '2024-05-15T10:00:00Z',
    hasBadReputation: false, source: 'Website',
    primaryBranchId: 'branch-1',
    log: customer1Log,
    impressions: customer1Impressions,
    lastModified: new Date().toISOString(),
  },
  { 
    id: 'CUST-0002', name: 'مؤسسة الأمل', phone: '0557654321', email: 'info@alamal.org', joinDate: '2023-03-22', 
    type: CustomerType.Corporate, governorate: 'جدة', streetAddress: undefined,
    classification: CustomerClassification.Silver, 
    points: 780, totalPointsEarned: 850, totalPointsUsed: 70,
    totalPurchases: 8500, purchaseCount: 1, lastPurchaseDate: '2024-05-10T14:20:00Z',
    hasBadReputation: true, source: 'Website',
    primaryBranchId: 'branch-2',
    log: [{ invoiceId: 'INV-1020', date: '2024-05-10T14:20:00Z', details: 'منتج د - أسود - XL - 5 قطع', status: OrderStatus.Cancelled, feedback: null, pointsChange: 0, amount: 8500 }],
    impressions: [],
    lastModified: new Date().toISOString(),
  },
  { 
    id: 'CUST-0003', name: 'محمد عبد الله', phone: '0512345678', email: 'mohammed.a@email.com', joinDate: '2023-05-10', 
    type: CustomerType.Normal, governorate: 'الدمام', streetAddress: 'شارع الأمير محمد',
    classification: CustomerClassification.Bronze, 
    points: 320, totalPointsEarned: 320, totalPointsUsed: 0,
    totalPurchases: 2500, purchaseCount: 1, lastPurchaseDate: '2024-04-28T09:00:00Z',
    hasBadReputation: false, source: 'Facebook',
    primaryBranchId: 'branch-1',
    log: customer3Log,
    impressions: [],
    lastModified: new Date().toISOString(),
  },
  { 
    id: 'CUST-0004', name: 'سارة إبراهيم', phone: '0598765432', email: 'sara.i@email.com', joinDate: '2023-08-01', 
    type: CustomerType.Normal, governorate: 'الرياض', streetAddress: undefined,
    classification: CustomerClassification.Bronze, 
    points: 150, totalPointsEarned: 150, totalPointsUsed: 0,
    totalPurchases: 1200, purchaseCount: 1, lastPurchaseDate: '2024-05-20T18:45:00Z',
    hasBadReputation: false, source: 'Facebook',
    log: [{ invoiceId: 'INV-1025', date: '2024-05-20T18:45:00Z', details: 'منتج أ - وردي - M - 1 قطعة', status: OrderStatus.Shipped, feedback: null, pointsChange: 120, amount: 1200 }],
    impressions: [],
    lastModified: new Date().toISOString(),
  },
];

export const mockComplaintTypes: string[] = [
    'مشكلة في جودة المنتج',
    'تأخير في الشحن',
    'خطأ في الطلب',
    'سوء تعامل من الموظف',
    'مشكلة في الفاتورة',
    'استفسار عام'
];


const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const today = new Date();

export const mockComplaints: Complaint[] = [
  {
    complaintId: 'CMPT-001',
    customerId: 'CUST-0001',
    customerName: 'شركة النور',
    dateOpened: threeDaysAgo.toISOString(),
    channel: ComplaintChannel.Email,
    type: 'مشكلة في جودة المنتج',
    priority: ComplaintPriority.Urgent,
    status: ComplaintStatus.Escalated,
    description: 'المنتج الذي استلمناه لا يعمل كما هو متوقع وهناك عيوب واضحة في التصنيع.',
    assignedTo: 'user-2',
    resolutionNotes: '', // This field is no longer primary, log is used instead.
    dateClosed: null,
    log: [
      { user: 'System', date: threeDaysAgo.toISOString(), action: 'تم تسجيل الشكوى.' },
      { user: 'فاطمة علي', date: threeDaysAgo.toISOString(), action: 'استلمت الشكوى وبدأت المراجعة.' },
      { user: 'محمود', date: yesterday.toISOString(), action: 'تم تصعيد الشكوى للإدارة لعدم التوصل لحل مرضي.' },
    ],
    productId: 'prod-3',
    productColor: 'أحمر',
    productSize: '42',
    lastModified: new Date().toISOString(),
  },
  {
    complaintId: 'CMPT-002',
    customerId: 'CUST-0002',
    customerName: 'مؤسسة الأمل',
    dateOpened: yesterday.toISOString(),
    channel: ComplaintChannel.Phone,
    type: 'تأخير في الشحن',
    priority: ComplaintPriority.Medium,
    status: ComplaintStatus.InProgress,
    description: 'تم تأكيد الطلب منذ 5 أيام ولم يتم شحنه حتى الآن.',
    assignedTo: 'user-3',
    resolutionNotes: '',
    dateClosed: null,
    log: [
       { user: 'System', date: yesterday.toISOString(), action: 'تم تسجيل الشكوى.' },
       { user: 'خالد سعيد', date: yesterday.toISOString(), action: 'استلم الشكوى وبدأ المراجعة.' },
       { user: 'خالد سعيد', date: today.toISOString(), action: 'تم التواصل مع شركة الشحن لتسريع التوصيل.' },
    ],
    lastModified: new Date().toISOString(),
  },
  {
    complaintId: 'CMPT-003',
    customerId: 'CUST-0003',
    customerName: 'محمد عبد الله',
    dateOpened: new Date('2024-05-20T10:00:00Z').toISOString(),
    channel: ComplaintChannel.WhatsApp,
    type: 'خطأ في الطلب',
    priority: ComplaintPriority.Normal,
    status: ComplaintStatus.Resolved,
    description: 'وصلني منتج مختلف عن الذي طلبته.',
    assignedTo: 'user-2',
    resolutionNotes: '',
    dateClosed: new Date('2024-05-21T14:30:00Z').toISOString(),
    log: [
        { user: 'System', date: new Date('2024-05-20T10:00:00Z').toISOString(), action: 'تم تسجيل الشكوى.'},
        { user: 'فاطمة علي', date: new Date('2024-05-20T11:00:00Z').toISOString(), action: 'استلمت الشكوى وبدأت المراجعة.'},
        { user: 'فاطمة علي', date: new Date('2024-05-21T14:30:00Z').toISOString(), action: 'تم حل المشكلة: تم إرسال المنتج الصحيح للعميل مع بوليصة إرجاع.'}
    ],
    lastModified: new Date().toISOString(),
  },
  {
    complaintId: 'CMPT-004',
    customerId: 'CUST-0004',
    customerName: 'سارة إبراهيم',
    dateOpened: today.toISOString(),
    channel: ComplaintChannel.Facebook,
    type: 'استفسار عام',
    priority: ComplaintPriority.Normal,
    status: ComplaintStatus.Open,
    description: 'أريد معرفة المزيد عن سياسة الإرجاع.',
    assignedTo: 'user-4',
    resolutionNotes: '',
    dateClosed: null,
    log: [
        { user: 'System', date: today.toISOString(), action: 'تم تسجيل الشكوى.'}
    ],
    lastModified: new Date().toISOString(),
  },
    {
    complaintId: 'CMPT-005',
    customerId: 'CUST-0001',
    customerName: 'شركة النور',
    dateOpened: yesterday.toISOString(),
    channel: ComplaintChannel.Email,
    type: 'مشكلة في الفاتورة',
    priority: ComplaintPriority.Medium,
    status: ComplaintStatus.PendingCustomer,
    description: 'يوجد خطأ في حساب الضريبة في الفاتورة الأخيرة.',
    assignedTo: 'user-3',
    resolutionNotes: '',
    dateClosed: null,
    log: [
        { user: 'System', date: yesterday.toISOString(), action: 'تم تسجيل الشكوى.'},
        { user: 'خالد سعيد', date: yesterday.toISOString(), action: 'استلم الشكوى وبدأ المراجعة.'},
        { user: 'خالد سعيد', date: today.toISOString(), action: 'تم التواصل مع العميل وإرسال فاتورة مصححة وفي انتظار رده.'}
    ],
    lastModified: new Date().toISOString(),
  },
  {
    complaintId: 'CMPT-006',
    customerId: 'CUST-0002',
    customerName: 'مؤسسة الأمل',
    dateOpened: today.toISOString(),
    channel: ComplaintChannel.Phone,
    type: 'مشكلة في جودة المنتج',
    priority: ComplaintPriority.Urgent,
    status: ComplaintStatus.Open,
    description: 'المنتج توقف عن العمل بعد يومين من الاستخدام.',
    assignedTo: undefined,
    resolutionNotes: '',
    dateClosed: null,
    log: [
        { user: 'System', date: today.toISOString(), action: 'تم تسجيل الشكوى.'}
    ],
    productId: 'prod-1',
    productColor: 'أبيض',
    productSize: 'L',
    lastModified: new Date().toISOString(),
  },
];


export const mockDailyInquiries: DailyInquiry[] = [
  {
    id: 'inq-1',
    userId: 'user-4',
    userName: 'هند رضا',
    date: new Date().toISOString(),
    productInquiry: 'حذاء رياضي موديل X',
    customerGovernorate: 'القاهرة',
    lastModified: new Date().toISOString(),
  },
  {
    id: 'inq-2',
    userId: 'user-3',
    userName: 'خالد سعيد',
    date: new Date().toISOString(),
    productInquiry: 'قميص كلاسيك لون كحلي',
    customerGovernorate: 'الجيزة',
    lastModified: new Date().toISOString(),
  },
    {
    id: 'inq-3',
    userId: 'user-4',
    userName: 'هند رضا',
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    productInquiry: 'بنطلون جينز مقاس 38',
    customerGovernorate: 'الإسكندرية',
    lastModified: new Date().toISOString(),
  }
];