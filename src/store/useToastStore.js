import { create } from 'zustand';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

const useToastStore = create((set) => ({
    toasts: [],

    // Add a new toast
    // toast: { title, message, type: 'success' | 'error' | 'warning', duration: 3000 }
    addToast: (toast) => {
        const id = generateId();
        const newToast = { ...toast, id, duration: toast.duration || 3000 };

        set((state) => ({
            toasts: [...state.toasts, newToast],
        }));

        return id;
    },

    // Remove a toast by ID
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));

export default useToastStore;
