import React from 'react';

const DoctorInfoCard = ({
  name,
  title,
  degree,
  email,
  phone,
  code,
  avatarUrl,
  className = "",
}) => (
  <div className={`flex items-start gap-3 p-3 border-1 border-blue-100 rounded-xl bg-blue-50 w-full ${className}`}>
    <img
      src={avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
      alt="Doctor Avatar"
      className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
      onError={(e) => { e.currentTarget.src = 'https://randomuser.me/api/portraits/men/32.jpg'; }}
    />
    <div className='flex flex-col gap-0.5 min-w-0'>
      <div className="font-bold text-gray-700 leading-tight mb-1  ">{name}</div>
      {title && <div className="text-xs text-gray-600 font-normal leading-tight mb-1">{title}</div>}
      {degree && <div className="text-[10px] text-gray-600 leading-tight">{degree}</div>}

      <div className=" space-y-0.5">
        {email && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 truncate">
            <img src="/mail.png" alt="Email" className="w-4 h-4 opacity-60" />
            {email}
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
            <img src="/phone.png" alt="Phone" className="w-4 h-4 opacity-60" />
            {phone}
          </div>
        )}
        {code && (
          <div className="text-[10px] text-gray-400 mt-0.5">ID: {code}</div>
        )}
      </div>
    </div>
  </div>
);

export default DoctorInfoCard;
