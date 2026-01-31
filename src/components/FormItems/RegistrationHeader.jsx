import React from 'react';

const RegistrationHeader = ({ title, subtitle , children }) => {
    return (
        <div className="flex-none py-3 text-center border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
            {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
            {children}
        </div>
    );
};

export default RegistrationHeader;
