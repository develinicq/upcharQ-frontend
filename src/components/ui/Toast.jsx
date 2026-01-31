import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';
import useToastStore from '../../store/useToastStore';
const check = '/toast/success.png';
const alert = '/toast/alert.png';
const error = '/toast/error.png';

const variants = {
    success: {
        icon: () => <img src={check} alt="" className='h-8 w-8' />,
        titleColor: 'text-success-300',
        progressBarColor: 'bg-success-200',
        bgGradient: 'bg-[linear-gradient(to_right,_#F0FDF4_0%,_#FFFFFF_60%)]',
        defaultTitle: 'Saved Successfully',
        defaultMessage: 'Your changes have been saved successfully',
    },
    error: {
        icon: () => <img src={error} alt="" className='h-8 w-8' />,
        titleColor: 'text-error-400',
        progressBarColor: 'bg-error-400',
        bgGradient: 'bg-[linear-gradient(to_right,_#FEF2F2_0%,_#FFFFFF_60%)]',
        defaultTitle: 'Error Occurred',
        defaultMessage: 'Connection error. Unable to connect to the server at present',
    },
    warning: {
        icon: () => <img src={alert} alt="" className='h-8 w-8' />,
        titleColor: 'text-warning2-400',
        progressBarColor: 'bg-warning2-400',
        bgGradient: 'bg-[linear-gradient(to_right,_#FFFBEB_0%,_#FFFFFF_60%)]',
        defaultTitle: 'Action Required',
        defaultMessage: 'Incomplete fields. Please fill in all required information now',
    },
};

const Toast = ({ id, type = 'success', title, message, duration = 3000 }) => {
    const removeToast = useToastStore((state) => state.removeToast);
    const [isExiting, setIsExiting] = useState(false);
    const variant = variants[type] || variants.success;
    const Icon = variant.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        // Wait for exit animation to finish before removing from store
        setTimeout(() => {
            removeToast(id);
        }, 300); // Match animation duration
    };

    return (
        <div
            className={`relative flex w-full max-w-[400px] overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 transition-all duration-300 ease-in-out pointer-events-auto
        ${isExiting ? 'animate-out fade-out slide-out-to-right-full' : 'animate-in slide-in-from-top-full fade-in'}
      `}
            role="alert"
        >
            {/* Main Content */}
            <div className={`flex items-center gap-4 w-full p-4 ${variant.bgGradient}`}>
                {/* Icon */}
                <div className={`flex-shrink-0 ${variant.iconContainer || ''}`}>
                    <Icon className="h-8 w-8" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-medium ${variant.titleColor} truncate`}>
                        {title || variant.defaultTitle}
                    </p>
                    <p className="text-[12px] text-secondary-grey200 ">
                        {message || variant.defaultMessage}
                    </p>
                </div>

            </div>

            {/* Bottom Bar (Progress) */}
            <div className="absolute bottom-0 left-0 h-[4px] w-full bg-gray-100">
                <div
                    className={`h-full ${variant.progressBarColor}`}
                    style={{
                        animation: `shrink ${duration}ms linear forwards`,
                    }}
                />
                <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
            </div>
        </div>
    );
};

export default Toast;
