import { IdCard, Mail, Phone } from 'lucide-react';
import React from 'react';

const DoctorInfoCard = ({
  name = 'Dr. Milind Chauhan',
  title = 'General Physician',
  degree = 'MBBS, MD - General Medicine',
  email = 'Milindchauhan@gmail.com',
  phone = '+91 91753 67487',
  code = 'DO00123',
  avatarUrl = 'https://randomuser.me/api/portraits/men/32.jpg',
}) => (
  <div className="flex items-center gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
    <div className='flex gap-4 w-[382px]'>
      <img
        src={avatarUrl}
        alt="Doctor Avatar"
        className="w-[132px] h-[132px] rounded-full object-cover border-[0.5px] border-blue-200"
        onError={(e) => { e.currentTarget.src = 'https://randomuser.me/api/portraits/men/32.jpg'; }}
      />
      <div className='flex flex-col gap-1'>
        <div className="font-semibold text-gray-800 text-base">{name}</div>
        {title ? (<div className="text-sm text-gray-600">{title}</div>) : null}
        {degree ? (<div className="text-sm text-gray-600">{degree}</div>) : null}
        {email ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="text-blue-500 h-5 w-5" />
            <span>{email}</span>
          </div>
        ) : null}
        {phone ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="text-blue-500 h-5 w-5" />
            <span>{phone}</span>
          </div>
        ) : null}
        {code ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <IdCard className="text-blue-500 h-5 w-5" />
            <span>{code}</span>
          </div>
        ) : null}
      </div>
    </div>
  </div>
);

export default DoctorInfoCard;
