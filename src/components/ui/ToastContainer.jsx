import React from 'react';
import useToastStore from '../../store/useToastStore';
import Toast from './Toast';

const ToastContainer = () => {
    const toasts = useToastStore((state) => state.toasts);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-[400px] pointer-events-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
};

export default ToastContainer;
