import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const notify = (message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3500);
  };
  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div className={`toast ${toast.type}`} key={toast.id}>{toast.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
