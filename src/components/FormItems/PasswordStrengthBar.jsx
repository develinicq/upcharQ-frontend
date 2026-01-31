import React from 'react';


const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  return score;
};

const getStrengthLabel = (score) => {
  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', percent: 33 };
  if (score <= 4) return { label: 'Medium', color: 'bg-yellow-400', percent: 66 };
  return { label: 'Strongest', color: 'bg-green-500', percent: 100 };
};

const PasswordStrengthBar = ({ password }) => {
  const score = getStrength(password);
  const { label, color, percent } = getStrengthLabel(score);

  return (
      <div className="flex items-center gap-2">
        <span className={`text-sm ${color === 'bg-red-500' ? 'text-red-400' : color === 'bg-yellow-400' ? 'text-yellow-600' : 'text-green-600'}`}>{label}</span>
        <div className="flex-1 h-[6px] bg-gray-100 rounded-full overflow-hidden">
          <div className={`${color} h-full rounded-full transition-all duration-300`} style={{ width: `${percent}%` }} />
        </div>
      </div>
  );
};

export default PasswordStrengthBar;
