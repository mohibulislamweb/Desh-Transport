import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

// 🔔 alert() এর বদলে সুন্দর নোটিফিকেশন
// যেকোনো জায়গা থেকে: notify("মেসেজ", "success" | "error" | "info")
const listeners = new Set();
let counter = 0;

export const notify = (message, type = "info") => {
  const toast = { id: ++counter, message, type };
  listeners.forEach((fn) => fn(toast));
};

// API error থেকে বাংলা মেসেজ বের করা
export const errorMessage = (err, fallback = "সমস্যা হয়েছে, আবার চেষ্টা করুন") => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === "ECONNABORTED") return "সার্ভার সাড়া দিচ্ছে না, একটু পর আবার চেষ্টা করুন";
  if (err && !err.response) return "ইন্টারনেট সংযোগ বা সার্ভারে সমস্যা, আবার চেষ্টা করুন";
  return fallback;
};

const icons = { success: CheckCircle2, error: AlertTriangle, info: Info };

export const ToastHost = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const add = (t) => {
      setToasts((list) => [...list.slice(-2), t]);
      setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), 4200);
    };
    listeners.add(add);
    return () => listeners.delete(add);
  }, []);

  return (
    <div className="dt-toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} className={`dt-toast dt-toast-${t.type}`}>
            <Icon size={20} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
};
