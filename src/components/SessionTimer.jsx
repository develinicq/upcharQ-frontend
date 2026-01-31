import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const SessionTimer = ({ startTime, paused }) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (paused) return; // Freeze timer on pause

        const calculateSeconds = () => {
            if (startTime) {
                const start = new Date(startTime).getTime();
                const now = Date.now();
                const diff = Math.max(0, Math.floor((now - start) / 1000));
                setSeconds(diff);
            } else {
                setSeconds(s => s + 1);
            }
        };

        // Initial update
        if (startTime) calculateSeconds();

        const interval = setInterval(() => {
            if (startTime) {
                calculateSeconds();
            } else {
                setSeconds(s => s + 1);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="flex items-center gap-1 bg-success-100 text-success-300 px-[6px] py-[2px] rounded-md text-sm">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(seconds)}
        </div>
    );
};

export default SessionTimer;
