import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

let idCounter = 0;

const TYPE_TO_COLOR = {
  success: {
    bg: "bg-green-600",
    ring: "ring-green-400/30",
    icon: (
      <svg
        className="w-4 h-4 text-white"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  error: {
    bg: "bg-red-600",
    ring: "ring-red-400/30",
    icon: (
      <svg
        className="w-4 h-4 text-white"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0 1 1 0 01-2 0zm.293-7.707a1 1 0 011.414 0L12 6.586l1.293-1.293a1 1 0 011.414 1.414L13.414 8l1.293 1.293a1 1 0 01-1.414 1.414L12 9.414l-1.293 1.293a1 1 0 01-1.414-1.414L10.586 8 9.293 6.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  info: {
    bg: "bg-indigo-600",
    ring: "ring-indigo-400/30",
    icon: (
      <svg
        className="w-4 h-4 text-white"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path d="M9 9h2v6H9z" />
        <path d="M10 7a1.25 1.25 0 110-2.5A1.25 1.25 0 0110 7z" />
      </svg>
    ),
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const add = useCallback(
    (toast) => {
      const id = ++idCounter;
      const {
        type = "info",
        title,
        description,
        duration = 3500,
      } = toast || {};
      setToasts((curr) => [
        { id, type, title, description, createdAt: Date.now() },
        ...curr,
      ]);
      const timer = setTimeout(() => remove(id), duration);
      timersRef.current.set(id, timer);
      return id;
    },
    [remove]
  );

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) clearTimeout(timer);
      timersRef.current.clear();
    },
    []
  );

  const api = useMemo(
    () => ({
      add,
      remove,
      success: (title, description, opts) =>
        add({ type: "success", title, description, ...(opts || {}) }),
      error: (title, description, opts) =>
        add({ type: "error", title, description, ...(opts || {}) }),
      info: (title, description, opts) =>
        add({ type: "info", title, description, ...(opts || {}) }),
    }),
    [add, remove]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[10000] space-y-3">
        {toasts.map((t) => {
          const conf = TYPE_TO_COLOR[t.type] || TYPE_TO_COLOR.info;
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-medium ring-1 ${conf.ring} bg-[#1a1a2e] text-white`}
            >
              <div
                className={`mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded ${conf.bg} shadow-light`}
              >
                {conf.icon}
              </div>
              <div className="flex-1">
                {t.title && (
                  <div className="text-sm font-semibold">{t.title}</div>
                )}
                {t.description && (
                  <div className="text-xs text-gray-300 mt-0.5">
                    {t.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};
