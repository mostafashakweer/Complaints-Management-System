import React, { useState } from "react";
import { User, UserRole } from "../types";
import axios from "axios";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "https://dag-system-drmwt3ekc-ibrahem-saieds-projects.vercel.app/api/v1/auth/login",
        { userName, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // تأكد من شكل الاستجابة من الـ API
      console.log("Login response data:", response.data);

      // أغلب الـ APIs ترجّع المستخدم في data.user أو user مباشرةً
      const userData =
        response.data.user ||
        response.data.data?.user ||
        response.data.data ||
        null;

      // وغالبًا التوكن يكون إمّا token أو accessToken داخل data
      const token: string =
        response.data.token ||
        response.data.accessToken ||
        response.data.data?.token ||
        response.data.data?.accessToken ||
        "";

      if (userData && token) {
        // Store token in localStorage for API calls
        localStorage.setItem("token", token);
        
        // Map user data to match User interface
        // Handle both username and userName from API
        // Map role from API to UserRole enum
        let mappedRole = UserRole.Staff; // Default
        if (userData.role) {
          // Try to match the role from API to UserRole enum
          const roleString = String(userData.role).trim();
          const roleMap: Record<string, UserRole> = {
            'موظف': UserRole.Staff,
            'موديريتور': UserRole.Moderator,
            'تيم ليدر': UserRole.TeamLeader,
            'مدير حسابات': UserRole.AccountsManager,
            'مدير عام': UserRole.GeneralManager,
            // English fallbacks if API uses English
            'Staff': UserRole.Staff,
            'Moderator': UserRole.Moderator,
            'TeamLeader': UserRole.TeamLeader,
            'AccountsManager': UserRole.AccountsManager,
            'GeneralManager': UserRole.GeneralManager,
          };
          mappedRole = roleMap[roleString] || UserRole.Staff;
        }
        
        const user: User = {
          ...userData,
          username: userData.username || userData.userName || userData.user_name || "",
          // Ensure all required fields are present
          id: userData.id || userData._id || "",
          name: userData.name || userData.userName || userData.username || "",
          password: "", // Don't store password
          role: mappedRole,
          phone: userData.phone || "",
          email: userData.email || "",
          lastModified: userData.lastModified || new Date().toISOString(),
        };
        
        // Store user in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        
        console.log("Login successful, user:", user);
        console.log("User role:", user.role);
        console.log("Token stored:", token ? "Yes" : "No");
        
        // Validate user object before passing to onLogin
        if (!user.id || !user.username || !user.role) {
          console.error("Invalid user object:", user);
          setError("بيانات المستخدم غير صحيحة. الرجاء المحاولة مرة أخرى.");
          return;
        }
        
        onLogin(user); // نخزن اليوزر
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
      }
    } catch (err: any) {
      console.error("Login error:", err.response || err);
      setError(err.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول.");
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">
          نظام إدارة الشكاوى
        </h1>
        <p className="text-center text-text-secondary mb-8">
          الرجاء تسجيل الدخول للمتابعة
        </p>
        <form onSubmit={handleLogin}>
          {error && (
            <p className="bg-red-100 text-red-700 p-2 rounded-md mb-4 text-sm text-center">
              {error}
            </p>
          )}
          <div className="mb-4">
            <label
              htmlFor="username-input"
              className="block mb-2 text-sm font-medium text-text-primary">
              اسم المستخدم
            </label>
            <input
              type="text"
              id="username-input"
              value={userName}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              className="bg-background-muted border border-border text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password-input"
              className="block mb-2 text-sm font-medium text-text-primary">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="bg-background-muted border border-border text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full text-white bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
