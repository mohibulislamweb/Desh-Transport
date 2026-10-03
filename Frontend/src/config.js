import axios from "axios";

// 🌐 ব্যাকএন্ডের ঠিকানা এক জায়গায়
// Vercel এ VITE_API_URL সেট করলে সেটা ব্যবহার হবে, না হলে Render এর ঠিকানা
export const API_BASE = (
  import.meta.env.VITE_API_URL || "https://desh-transport-backend.onrender.com"
).replace(/\/$/, "");

export const API_URL = `${API_BASE}/api`;

// ===============================
// লগইন তথ্য (localStorage) — try/catch সহ, যাতে প্রাইভেট মোডেও ভাঙে না
// ===============================
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getAdminToken = () => read("adminToken");
export const getDriverToken = () => read("driverToken");

export const getDriver = () => {
  try {
    const data = JSON.parse(read("driver") || "null");
    if (data && !data.id && data._id) data.id = data._id;
    return data;
  } catch {
    return null;
  }
};

export const saveDriverSession = (token, driver) => {
  localStorage.setItem("driverToken", token);
  localStorage.setItem("driver", JSON.stringify(driver));
  // পুরোনো কোডের জন্য আলাদা key গুলোও রাখা হলো
  localStorage.setItem("driverId", driver.id || driver._id || "");
  localStorage.setItem("driverName", driver.driverName || "");
  localStorage.setItem("driverPhone", driver.phone || "");
};

export const clearDriverSession = () => {
  ["driverToken", "driver", "driverId", "driverName", "driverPhone"].forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
};

export const clearAdminSession = () => {
  try {
    localStorage.removeItem("adminToken");
  } catch {
    /* ignore */
  }
};

// ===============================
// 🔐 টোকেনসহ axios — প্রতিটা রিকোয়েস্টে নিজে থেকেই Authorization হেডার যাবে
// সেশন শেষ হলে (401) লগইন পেজে পাঠিয়ে দেবে
// ===============================
const createClient = (getToken, onExpired) => {
  const client = axios.create({ baseURL: API_URL, timeout: 60000 });

  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) onExpired();
      return Promise.reject(error);
    }
  );

  return client;
};

// সাধারণ (লগইন ছাড়া) API
export const publicApi = axios.create({ baseURL: API_URL, timeout: 60000 });

export const adminApi = createClient(getAdminToken, () => {
  clearAdminSession();
  if (window.location.pathname !== "/admin-login") window.location.href = "/admin-login";
});

export const driverApi = createClient(getDriverToken, () => {
  clearDriverSession();
  if (window.location.pathname !== "/login") window.location.href = "/login";
});
