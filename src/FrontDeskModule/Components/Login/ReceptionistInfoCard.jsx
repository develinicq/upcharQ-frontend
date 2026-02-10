import React from 'react';
import { Mail, Phone } from 'lucide-react';

const ReceptionistInfoCard = ({
    name,
    designation,
    email,
    phone,
    code,
    avatarUrl,
    className = "",
}) => {
    // Helper to get initials
    const getInitials = (n) => {
        if (!n) return '';
        const parts = n.trim().split(' ');
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div className={`flex items-center gap-3 p-2 border-[0.5px] border-blue-200 rounded-sm bg-[#F8FAFC] w-full ${className}`}>
            {/* Avatar or Placeholder */}
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt="Receptionist Avatar"
                    className="w-16 h-16 rounded-full object-cover border border-gray-100 flex-shrink-0"
                />
            ) : (
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-500 font-light text-2xl flex-shrink-0 border border-blue-200">
                    {getInitials(name)}
                </div>
            )}

            <div className='flex flex-col min-w-0 gap-0'>
                <div className="font-semibold text-gray-700 text-[12px] leading-tight">{name}</div>
                {designation && <div className="text-[10px] text-gray-500 font-medium mb-0.5">{designation}</div>}

                <div className="flex flex-col gap-1">
                    {email && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 truncate">
                            <img src="/mail.png" alt="Email" className="w-3 h-3 opacity-60" />
                            {email}
                        </div>
                    )}
                    {phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <img src="/phone.png" alt="Phone" className="w-3 h-3 opacity-60" />
                            {phone}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceptionistInfoCard;
