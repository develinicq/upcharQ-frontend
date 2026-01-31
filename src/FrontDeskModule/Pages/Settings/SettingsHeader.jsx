import React from 'react';
import AvatarCircle from '../../../components/AvatarCircle';
import { hospital } from '../../../../public/index.js';

const SettingsHeader = ({ name, children }) => {
    return (
        <div className="-mx-6">
            <div className="relative">
                <img src={hospital} alt="cover" className="w-full h-40 object-cover" />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <div className="rounded-full ring-4 ring-white shadow-md">
                        <AvatarCircle
                            name={name}
                            size="l"
                            color="blue"
                            className="w-24 h-24 text-3xl"
                        />
                    </div>
                </div>
            </div>
            <div className="bg-white border-b border-gray-200">
                <div className="px-6 pt-12">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SettingsHeader;
