/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  function showToast(message, type = "success") {
    setToast({
      message,
      type,
    });

    // Через 3 секунды уведомление исчезает само
    setTimeout(() => {
      setToast({
        message: "",
        type: "success",
      });
    }, 3000);
  }

  function hideToast() {
    setToast({
      message: "",
      type: "success",
    });
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}