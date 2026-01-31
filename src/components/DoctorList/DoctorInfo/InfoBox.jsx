import React from 'react';

const InfoBox = ({ label, value, valueClass = '' }) => (
    <div className="w-[116px] h-[100px] border-dashed border border-[#D6D6D6] rounded-sm text-left p-[10px]">
        <div className='flex flex-col h-full justify-between items-start'>
            <span className="text-[#626060] text-sm text-left" style={{ lineHeight: '17px' }}>{label}</span>
            <span className={`font-semibold text-sm text-left ${valueClass}`} style={{ lineHeight: '17px' }}>{value}</span>
        </div>
    </div>
);

export default InfoBox;
