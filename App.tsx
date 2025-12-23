import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Page,
  Complaint,
  Customer,
  User,
  Product,
  UserRole,
  ActivityLogEntry,
  ThemeSettings,
  SystemSettings,
  DailyInquiry,
  AppState,
  ComplaintStatus,
  Branch,
  FollowUpTask,
  CustomerImpression,
  FollowUpStatus,
  ComplaintPriority,
  DailyFeedbackTask,
  DailyFeedbackStatus,
} from "./types";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ComplaintsLog from "./pages/ComplaintsLog";
import CustomersPage from "./pages/Customers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CustomerProfile from "./pages/CustomerProfile";
import ManagerDashboard from "./pages/ManagerDashboard";
import InventoryPage from "./pages/Products";
import LoginPage from "./pages/LoginPage";
import ActivityLogPage from "./pages/ActivityLog";
import DailyInquiriesPage from "./pages/DailyInquiries";
import UsersPage from "./pages/Users";
import BranchesPage from "./pages/Branches";
import FollowUpPage from "./pages/FollowUp";
import DailyFeedbackPage from "./pages/DailyFeedback";
import {
  mockUsers,
  mockCustomers,
  mockComplaints,
  mockProducts,
  mockDailyInquiries,
  mockBranches,
  mockFollowUpTasks,
  mockDailyFeedbackTasks,
} from "./services/mockData";
import { LogoutIcon, MenuIcon } from "./components/icons";
import NotificationToast from "./components/NotificationToast";
import { fetchState, saveState } from "./services/apiService";
import SaveStatusIndicator from "./components/SaveStatusIndicator";
import { getAllComplaints } from "./src/api/complaintsApi";

const DEFAULT_THEME: ThemeSettings = {
  colors: {
    primary: "#1E40AF",
    secondary: "#DBEAFE",
    accent: "#10B981",
    danger: "#DC2626",
    warning: "#F59E0B",
    info: "#3B82F6",
    accent2: "#9333EA",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    sidebarBackground: "#1E40AF",
    sidebarText: "#FFFFFF",
    sidebarActiveBackground: "#1D4ED8",
    sidebarLinkText: "#93C5FD",
    badgeSuccessBg: "#D1FAE5",
    badgeSuccessText: "#065F46",
    badgeWarningBg: "#FEF3C7",
    badgeWarningText: "#92400E",
    badgeDangerBg: "#FEE2E2",
    badgeDangerText: "#991B1B",
    badgeInfoBg: "#DBEAFE",
    badgeInfoText: "#1E40AF",
    badgeMutedBg: "#F3F4F6",
    badgeMutedText: "#4B5563",
    border: "#E5E7EB",
    backgroundMuted: "#F3F4F6",
    tableHeaderBg: "#F9FAFB",
    tableHeaderText: "#374151",
    link: "#2563EB",
    textDisabled: "#9CA3AF",
    badgeGoldBg: "#FEFCE8",
    badgeGoldText: "#854D0E",
    badgePendingBg: "#FFF7ED",
    badgePendingText: "#C2410C",
  },
  font: "Tajawal",
};

const FullScreenMessage: React.FC<{ message: string; isError?: boolean }> = ({
  message,
  isError = false,
}) => (
  <div className="bg-background min-h-screen flex flex-col items-center justify-center text-center p-4">
    <h1
      className={`text-4xl font-bold ${
        isError ? "text-danger" : "text-primary animate-pulse"
      }`}>
      {message}
    </h1>
    {!isError && <p className="text-text-secondary mt-2">...الرجاء الانتظار</p>}
    {isError && (
      <p className="text-text-secondary mt-2">
        حدث خطأ غير متوقع. الرجاء التأكد من تشغيل الخادم وإعادة تحميل التطبيق.
      </p>
    )}
  </div>
);

type SaveStatus = "unsaved" | "saving" | "saved" | "error";
interface ComplaintLogFilter {
  status?: ComplaintStatus | ComplaintStatus[];
  dateOpened?: string;
  dateClosed?: string;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>([]);
  const [dailyInquiries, setDailyInquiries] = useState<DailyInquiry[]>([]);
  const [dailyFeedbackTasks, setDailyFeedbackTasks] = useState<
    DailyFeedbackTask[]
  >([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    pointValue: 1,
    importSpend: 500,
    importPoints: 50,
    classification: {
      silver: 5000,
      gold: 15000,
      platinum: 50000,
    },
    companyName: "اسم الشركة",
    companyLogo: "",
    systemEmail: "",
    emailJsServiceId: "",
    emailJsTemplateId: "",
    emailJsPublicKey: "",
  });

  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<
    (User & { loginTimestamp?: number }) | null
  >(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(
    null
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);
  const [appState, setAppState] = useState<
    "loading" | "login" | "loggedIn" | "welcome" | "goodbye" | "error"
  >("loading");
  const [transitionMessage, setTransitionMessage] = useState<string>(
    "جاري تحميل البيانات من الخادم"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const debounceTimerRef = useRef<number | null>(null);
  const isUpdatingFromWs = useRef(false);
  const [complaintLogFilter, setComplaintLogFilter] =
    useState<ComplaintLogFilter | null>(null);

  // Function to fetch complaints from backend API
  const fetchComplaintsFromAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping complaints fetch');
        return;
      }
      const complaintsData = await getAllComplaints();
      setComplaints(complaintsData);
      console.log('Complaints loaded from backend API:', complaintsData.length);
    } catch (error) {
      console.error('Error fetching complaints from API:', error);
      // Don't set error state, just log it - fallback to mock data if needed
    }
  };

  // Initial data loading from server
  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await fetchState();
      if (fetchedData) {
        setUsers(fetchedData.users || []);
        setCustomers(fetchedData.customers || []);
        // Don't load complaints from fetchState, we'll load from API
        // setComplaints(fetchedData.complaints || []);
        setProducts(fetchedData.products || []);
        setBranches(fetchedData.branches || []);
        setFollowUpTasks(fetchedData.followUpTasks || []);
        setDailyInquiries(fetchedData.dailyInquiries || []);
        setDailyFeedbackTasks(fetchedData.dailyFeedbackTasks || []);
        setSystemSettings(fetchedData.systemSettings || systemSettings);
        const loadedTheme = {
          ...DEFAULT_THEME,
          ...fetchedData.theme,
          colors: { ...DEFAULT_THEME.colors, ...fetchedData.theme?.colors },
        };
        setTheme(loadedTheme);
        setActivityLog(fetchedData.activityLog || []);
        console.log("Data loaded from server.");
      } else {
        console.log("No data found on server. Initializing with mock data.");
        // First run, load mock data
        const initialUsers = mockUsers;
        const initialCustomers = mockCustomers;
        // Don't load mock complaints, we'll load from API
        // const initialComplaints = mockComplaints;
        const initialProducts = mockProducts;
        const initialDailyInquiries = mockDailyInquiries;
        const initialBranches = mockBranches;
        const initialFollowUpTasks = mockFollowUpTasks;
        const initialDailyFeedbackTasks = mockDailyFeedbackTasks;

        setUsers(initialUsers);
        setCustomers(initialCustomers);
        // setComplaints(initialComplaints);
        setProducts(initialProducts);
        setDailyInquiries(initialDailyInquiries);
        setBranches(initialBranches);
        setFollowUpTasks(initialFollowUpTasks);
        setDailyFeedbackTasks(initialDailyFeedbackTasks);

        // Immediately save this initial state to the server (without complaints)
        const initialState: AppState = {
          users: initialUsers,
          customers: initialCustomers,
          complaints: [], // Complaints will come from API
          products: initialProducts,
          dailyInquiries: initialDailyInquiries,
          branches: initialBranches,
          followUpTasks: initialFollowUpTasks,
          dailyFeedbackTasks: initialDailyFeedbackTasks,
          systemSettings, // uses initial state
          theme: DEFAULT_THEME,
          activityLog: [],
        };
        const success = await saveState(initialState);
        if (success) {
          console.log("Initial mock data sent to server.");
        } else {
          setAppState("error");
          setTransitionMessage("فشل الاتصال بالخادم");
          return;
        }
      }
      setIsDataInitialized(true);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch complaints from backend API when user is logged in
  useEffect(() => {
    if (currentUser && isDataInitialized) {
      fetchComplaintsFromAPI();
    }
  }, [currentUser, isDataInitialized]);

  // Effect for WebSocket connection for real-time updates
  useEffect(() => {
    if (!isDataInitialized) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    let ws: WebSocket;
    let reconnectInterval: number | undefined;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = undefined;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: AppState = JSON.parse(event.data);
          console.log("Received data from WebSocket");

          isUpdatingFromWs.current = true; // Set flag to prevent save-loop

          // Update all states
          setUsers(data.users || []);
          setCustomers(data.customers || []);
          setComplaints(data.complaints || []);
          setProducts(data.products || []);
          setBranches(data.branches || []);
          setFollowUpTasks(data.followUpTasks || []);
          setDailyInquiries(data.dailyInquiries || []);
          setDailyFeedbackTasks(data.dailyFeedbackTasks || []);
          setSystemSettings(data.systemSettings || systemSettings);
          // Only set theme if it exists, without merging. The broadcasted theme is the source of truth.
          if (data.theme) {
            setTheme(data.theme);
          }
          setActivityLog(data.activityLog || []);

          setSaveStatus("saved"); // The data is now in sync with the server
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected. Attempting to reconnect...");
        if (!reconnectInterval) {
          reconnectInterval = window.setInterval(() => {
            connect();
          }, 3000);
        }
      };
    };

    connect();

    return () => {
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
      if (ws) {
        ws.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataInitialized]);

  // Effect to reset the WebSocket update flag after a re-render
  useEffect(() => {
    if (isUpdatingFromWs.current) {
      isUpdatingFromWs.current = false;
    }
  });

  // Update app state after data is initialized
  useEffect(() => {
    if (isDataInitialized) {
      setTransitionMessage("نظام إدارة الشكاوى");
      const timer = setTimeout(() => setAppState("login"), 500);
      return () => clearTimeout(timer);
    }
  }, [isDataInitialized]);

  // Effect to save data to server on state change (debounced)
  const saveEffectDependencies = [
    users,
    customers,
    complaints,
    products,
    branches,
    followUpTasks,
    dailyInquiries,
    dailyFeedbackTasks,
    systemSettings,
    theme,
    activityLog,
  ];

  useEffect(() => {
    if (!isDataInitialized || isUpdatingFromWs.current) {
      return; // Don't save during initial load or if updating from WebSocket
    }

    setSaveStatus("unsaved");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const currentState: AppState = {
          users,
          customers,
          complaints,
          products,
          dailyInquiries,
          systemSettings,
          theme,
          activityLog,
          branches,
          followUpTasks,
          dailyFeedbackTasks,
        };
        const success = await saveState(currentState);
        if (!success) {
          // Only handle failure here. Success is handled by websocket echo.
          throw new Error("Server save call failed");
        }
      } catch (e) {
        console.error("An error occurred during the state save process:", e);
        setSaveStatus("error");
      }
    }, 1500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, saveEffectDependencies);

  // Apply theme to DOM
  useEffect(() => {
    const toKebabCase = (str: string) =>
      str.replace(/([a-z09]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
    const hexToRgbTriplet = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(
            result[3],
            16
          )}`
        : null;
    };

    Object.entries(theme.colors).forEach(([key, value]) => {
      if (value) {
        const rgbTriplet = hexToRgbTriplet(value as string);
        if (rgbTriplet) {
          document.documentElement.style.setProperty(
            `--color-${toKebabCase(key)}`,
            rgbTriplet
          );
        }
      }
    });

    document.documentElement.style.setProperty("--font-sans", theme.font);
  }, [theme]);

  const logUserAction = (details: string) => {
    if (!currentUser) return;
    const newEntry: ActivityLogEntry = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.userName,
      timestamp: new Date().toISOString(),
      type: "ACTION",
      details,
    };
    setActivityLog((prev) => [newEntry, ...prev]);
  };

  const showNotification = (
    message: string,
    type: "success" | "info" = "info"
  ) => {
    setNotification({ message, type });
  };

  const handleTriggerNotification = (
    complaint: Complaint,
    trigger: "URGENT_NEW" | "ESCALATION"
  ) => {
    let recipients: User[] = [];
    let message = "";
    let subject = "";

    if (trigger === "URGENT_NEW") {
      recipients = users.filter(
        (u) =>
          [
            UserRole.TeamLeader,
            UserRole.AccountsManager,
            UserRole.GeneralManager,
          ].includes(u.role) && u.email
      );
      message = `تم تسجيل شكوى عاجلة جديدة (${complaint.complaintId}) للعميل ${complaint.customerName}. الرجاء المتابعة الفورية.`;
      subject = `[شكوى عاجلة] ${complaint.complaintId}`;
    } else if (trigger === "ESCALATION") {
      recipients = users.filter(
        (u) =>
          [UserRole.AccountsManager, UserRole.GeneralManager].includes(
            u.role
          ) && u.email
      );
      message = `تم تصعيد الشكوى (${complaint.complaintId}) للعميل ${complaint.customerName} لعدم التوصل لحل. الرجاء التدخل.`;
      subject = `[تصعيد شكوى] ${complaint.complaintId}`;
    }

    if (recipients.length === 0) return;

    const {
      emailJsServiceId,
      emailJsTemplateId,
      emailJsPublicKey,
      companyName,
    } = systemSettings;
    const canSendEmail =
      emailJsServiceId && emailJsTemplateId && emailJsPublicKey;

    if (!canSendEmail) {
      const recipientNames = recipients.map((r) => r.name).join(", ");
      let logMessage = `تجهيز إشعار بخصوص "${subject}" إلى: ${recipientNames}.`;
      logMessage +=
        " (تنبيه: لم يتم إرسال بريد إلكتروني حقيقي. يرجى إكمال إعدادات EmailJS في صفحة الإعدادات.)";
      showNotification(
        `تم تسجيل إشعار. يرجى تكوين إعدادات البريد أولاً.`,
        "info"
      );
      logUserAction(logMessage);
      return;
    }

    recipients.forEach((recipient) => {
      if (recipient.email) {
        const templateParams = {
          to_name: recipient.name,
          to_email: recipient.email,
          from_name: companyName,
          subject: subject,
          message: message,
        };

        // The 'emailjs' global is available from the script in index.html
        (window as any).emailjs
          .send(
            emailJsServiceId,
            emailJsTemplateId,
            templateParams,
            emailJsPublicKey
          )
          .then(
            (response: any) => {
              logUserAction(
                `تم إرسال بريد إلكتروني بنجاح إلى ${recipient.name} (${recipient.email}). Status: ${response.status}`
              );
              showNotification(
                `تم إرسال إشعار إلى ${recipient.name}.`,
                "success"
              );
            },
            (error: any) => {
              console.error("EmailJS Error:", error);
              logUserAction(
                `فشل إرسال بريد إلكتروني إلى ${recipient.name} (${
                  recipient.email
                }). Error: ${JSON.stringify(error)}`
              );
              showNotification(
                `فشل إرسال إشعار إلى ${recipient.name}.`,
                "info"
              );
            }
          );
      }
    });
  };

  const getDefaultPageForRole = (role: UserRole): Page => {
    switch (role) {
      case UserRole.GeneralManager:
      case UserRole.AccountsManager:
        return "managerDashboard";
      case UserRole.Moderator:
        return "complaints";
      case UserRole.TeamLeader:
      case UserRole.Staff:
        return "dashboard";
      default:
        return "dashboard";
    }
  };

  const handleLogin = (user: User) => {
    const loginTimestamp = Date.now();
    setCurrentUser({ ...user, loginTimestamp });
    const newEntry: ActivityLogEntry = {
      id: `log-${loginTimestamp}`,
      userId: user.id,
      userName: user.userName,
      timestamp: new Date(loginTimestamp).toISOString(),
      type: "LOGIN",
      details: "تم تسجيل الدخول بنجاح.",
    };
    setActivityLog((prev) => [newEntry, ...prev]);
    setActivePage(getDefaultPageForRole(user.role));
    setTransitionMessage(`مرحباً بعودتك، ${user.userName}`);
    setAppState("welcome");
    setTimeout(() => {
      setAppState("loggedIn");
    }, 2500);
  };

  const handleLogout = useCallback(
    (isUnload = false) => {
      if (!currentUser) return;
      const logoutTimestamp = Date.now();
      const duration = currentUser.loginTimestamp
        ? Math.round((logoutTimestamp - currentUser.loginTimestamp) / 1000)
        : 0;

      const newEntry: ActivityLogEntry = {
        id: `log-${logoutTimestamp}`,
        userId: currentUser.id,
        userName: currentUser.userName,
        timestamp: new Date(logoutTimestamp).toISOString(),
        type: "LOGOUT",
        details: isUnload ? "تم إغلاق التطبيق." : "تم تسجيل الخروج.",
        duration,
      };
      setActivityLog((prev) => [newEntry, ...prev]);

      if (isUnload) {
        setCurrentUser(null);
      } else {
        setTransitionMessage("تم تسجيل الخروج بنجاح");
        setAppState("goodbye");
        setTimeout(() => {
          setCurrentUser(null);
          setAppState("login");
        }, 2500);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        handleLogout(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentUser, handleLogout]);

  const handleViewCustomer = (customerId: string) => {
    setViewingCustomerId(customerId);
  };

  const handleBackToList = () => {
    setViewingCustomerId(null);
  };

  const handleUpdateCustomer = (
    updatedCustomer: Customer,
    actionDetail?: string
  ) => {
    setCustomers(
      customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
    if (actionDetail && currentUser) {
      logUserAction(actionDetail);
    }
  };

  const handleNavigateToComplaints = (filters: ComplaintLogFilter) => {
    setComplaintLogFilter(filters);
    setViewingCustomerId(null);
    setActivePage("complaints");
  };

  const handleSaveImpression = (
    customerId: string,
    impression: CustomerImpression
  ) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    let updatedCustomer: Customer = {
      ...customer,
      impressions: [impression, ...(customer.impressions || [])],
      lastModified: new Date().toISOString(),
    };

    const newBranchName =
      branches.find((b) => b.id === impression.branchId)?.name || "غير معروف";

    if (
      customer.primaryBranchId &&
      customer.primaryBranchId !== impression.branchId
    ) {
      const oldBranchName =
        branches.find((b) => b.id === customer.primaryBranchId)?.name ||
        "غير معروف";

      const newFollowUp: FollowUpTask = {
        id: `follow-${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        dateCreated: new Date().toISOString(),
        reason: "تغيير العميل للفرع المعتاد",
        details: `العميل ${customer.name} زار فرع "${newBranchName}" بينما فرعه الأساسي هو "${oldBranchName}".`,
        status: FollowUpStatus.Pending,
        lastModified: new Date().toISOString(),
      };
      setFollowUpTasks((prev) => [newFollowUp, ...prev]);
      showNotification(`تم إنشاء مهمة متابعة لتغيير العميل للفرع.`, "info");
    }

    updatedCustomer.primaryBranchId = impression.branchId;

    setCustomers(
      customers.map((c) => (c.id === customerId ? updatedCustomer : c))
    );
    logUserAction(
      `تسجيل انطباع جديد للعميل ${customer.name} في فرع ${newBranchName}.`
    );

    // Auto-complete daily feedback tasks for multiple invoices
    if (
      impression.relatedInvoiceIds &&
      impression.relatedInvoiceIds.length > 0
    ) {
      let tasksUpdated = false;
      const updatedTasks = [...dailyFeedbackTasks];
      let completedInvoices: string[] = [];

      impression.relatedInvoiceIds.forEach((invoiceId) => {
        const taskIndex = updatedTasks.findIndex(
          (task) =>
            task.invoiceId === invoiceId &&
            task.customerId === customerId &&
            task.status === DailyFeedbackStatus.Pending
        );

        if (taskIndex !== -1) {
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            status: DailyFeedbackStatus.Completed,
            lastModified: new Date().toISOString(),
          };
          tasksUpdated = true;
          completedInvoices.push(invoiceId);
        }
      });

      if (tasksUpdated) {
        setDailyFeedbackTasks(updatedTasks);
        showNotification(
          `تم إكمال مهام التقييم للفواتير: ${completedInvoices.join(", ")}.`,
          "success"
        );
      }
    }
  };

  const handleSetPage = (page: Page) => {
    setViewingCustomerId(null);
    setActivePage(page);
  };

  if (
    appState === "loading" ||
    appState === "welcome" ||
    appState === "goodbye"
  ) {
    return <FullScreenMessage message={transitionMessage} />;
  }

  if (appState === "error") {
    return <FullScreenMessage message={transitionMessage} isError />;
  }

  if (appState === "login" || !currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const viewingCustomer = customers.find((c) => c.id === viewingCustomerId);

  const renderPage = () => {
    if (viewingCustomer) {
      return (
        <CustomerProfile
          customer={viewingCustomer}
          complaints={complaints.filter(
            (c) => c.customerId === viewingCustomer.id
          )}
          branches={branches}
          onBack={handleBackToList}
          onUpdateCustomer={handleUpdateCustomer}
          onSaveImpression={handleSaveImpression}
          systemSettings={systemSettings}
          currentUser={currentUser}
        />
      );
    }

    const allowedModeratorPages: Page[] = [
      "customers",
      "complaints",
      "settings",
      "dailyInquiries",
      "dailyFeedback",
    ];
    if (
      currentUser.role === UserRole.Moderator &&
      !allowedModeratorPages.includes(activePage)
    ) {
      return (
        <div className="text-center p-8 bg-surface rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-danger mb-4">
            وصول غير مصرح به
          </h2>
          <p className="text-text-secondary">
            صلاحياتك لا تسمح بالوصول لهذه الصفحة.
          </p>
        </div>
      );
    }

    switch (activePage) {
      case "dashboard":
        return <Dashboard complaints={complaints} users={users} />;
      case "managerDashboard":
        return (
          <ManagerDashboard
            complaints={complaints}
            customers={customers}
            onNavigateToComplaints={handleNavigateToComplaints}
          />
        );
      case "complaints":
        return (
          <ComplaintsLog
            complaints={complaints}
            setComplaints={setComplaints}
            users={users}
            customers={customers}
            products={products}
            currentUser={currentUser}
            showNotification={showNotification}
            logUserAction={logUserAction}
            onTriggerNotification={handleTriggerNotification}
            initialFilters={complaintLogFilter}
            onFiltersApplied={() => setComplaintLogFilter(null)}
            onViewCustomer={handleViewCustomer}
          />
        );
      case "customers":
        return (
          <CustomersPage
            customers={customers}
            setCustomers={setCustomers}
            onViewCustomer={handleViewCustomer}
            currentUser={currentUser}
            logUserAction={logUserAction}
          />
        );
      case "reports":
        return (
          <Reports
            complaints={complaints}
            users={users}
            customers={customers}
            dailyInquiries={dailyInquiries}
          />
        );
      case "products":
        return (
          <InventoryPage
            products={products}
            setProducts={setProducts}
            logUserAction={logUserAction}
          />
        );
      case "activityLog":
        return <ActivityLogPage log={activityLog} users={users} />;
      case "dailyInquiries":
        return (
          <DailyInquiriesPage
            inquiries={dailyInquiries}
            setInquiries={setDailyInquiries}
            currentUser={currentUser}
            logUserAction={logUserAction}
          />
        );
      case "users":
        return <UsersPage users={users} complaints={complaints} />;
      case "branches":
        return <BranchesPage branches={branches} customers={customers} />;
      case "followUp":
        return (
          <FollowUpPage
            tasks={followUpTasks}
            setTasks={setFollowUpTasks}
            users={users}
            currentUser={currentUser}
            onViewCustomer={handleViewCustomer}
          />
        );
      case "dailyFeedback":
        return (
          <DailyFeedbackPage
            tasks={dailyFeedbackTasks}
            setTasks={setDailyFeedbackTasks}
            customers={customers}
            currentUser={currentUser}
            branches={branches}
            onSaveImpression={handleSaveImpression}
            onViewCustomer={handleViewCustomer}
          />
        );
      case "settings":
        return (
          <Settings
            currentUser={currentUser}
            users={users}
            setUsers={setUsers}
            customers={customers}
            setCustomers={setCustomers}
            complaints={complaints}
            setComplaints={setComplaints}
            branches={branches}
            setBranches={setBranches}
            setActivePage={setActivePage}
            systemSettings={systemSettings}
            setSystemSettings={setSystemSettings}
            logUserAction={logUserAction}
            theme={theme}
            setTheme={setTheme}
            defaultTheme={DEFAULT_THEME}
            setDailyInquiries={setDailyInquiries}
            setActivityLog={setActivityLog}
          />
        );
      default:
        return <Dashboard complaints={complaints} users={users} />;
    }
  };

  const pageTitles: Record<Page, string> = {
    dashboard: "لوحة التحكم",
    managerDashboard: "لوحة تحكم المدير",
    complaints: "سجل الشكاوى",
    customers: "إدارة العملاء",
    reports: "التقارير",
    settings: "الإعدادات",
    products: "إدارة المخزون",
    activityLog: "شيت تقارير اليوم",
    dailyInquiries: "سجل الاستفسارات اليومية",
    users: "ملفات الموظفين",
    branches: "تقارير الفروع",
    followUp: "مهام المتابعة",
    dailyFeedback: "التقييمات اليومية",
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background text-text-primary">
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Custom Title Bar for Windows App feel */}
      <div className="title-bar h-8 bg-background-muted flex-shrink-0 flex items-center justify-center border-b border-border">
        <span
          className="text-xs text-text-secondary"
          style={{ WebkitAppRegion: "no-drag" as any }}>
          نظام إدارة الشكاوى
        </span>
      </div>

      <div className="flex-grow flex relative overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}></div>
        )}
        <Sidebar
          activePage={activePage}
          setActivePage={handleSetPage}
          currentUser={currentUser}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <div className="md:pr-64 w-full flex flex-col">
          <header className="bg-surface border-b border-border p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center">
              <button
                className="text-gray-500 hover:text-primary md:hidden ml-3"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open menu">
                <MenuIcon className="w-6 h-6" />
              </button>
              <h1 className="text-lg md:text-xl font-semibold">
                {viewingCustomer
                  ? `ملف العميل: ${viewingCustomer.name}`
                  : pageTitles[activePage]}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <SaveStatusIndicator status={saveStatus} />
              <div className="hidden sm:block text-right">
                <span className="text-sm font-semibold">
                  {currentUser?.name}
                </span>
                <span className="block text-xs text-gray-500">
                  {currentUser.role}
                </span>
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold ml-2 flex-shrink-0">
                {currentUser?.userName?.charAt(0) || ""}
              </div>
              <button
                onClick={() => handleLogout(false)}
                className="mr-2 text-gray-500 hover:text-danger"
                title="تسجيل الخروج">
                <LogoutIcon className="w-6 h-6" />
              </button>
            </div>
          </header>
          <main className="p-4 md:p-8 flex-grow overflow-y-auto">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
