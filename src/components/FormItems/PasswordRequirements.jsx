import { Check } from 'lucide-react';
import React from 'react';
const tick = '/tick.svg'
const green ='/tick_green.svg'

const requirements = [
  {
    label: 'At least 8 -15 characters long',
    test: (pw) => pw.length >= 8 && pw.length <= 15,
  },
  {
    label: 'Contains uppercase letter (A-Z)',
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    label: 'Contains lowercase letter (a-z)',
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    label: 'Contains number (0-9)',
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    label: 'Contains special character (!@#$%^&*)',
    test: (pw) => /[!@#$%^&*]/.test(pw),
  },
];

const PasswordRequirements = ({ password }) => (
  <div className="flex flex-col gap-1">
    <div className="font-medium text-black text-sm">Password Requirements</div>
    <ul className="text-sm space-y-1">
      {requirements.map((req, idx) => {
        const passed = req.test(password);
        return (
          <li key={idx} className={passed ? 'text-success-300 flex items-center gap-1' : 'text-secondary-grey200 flex gap-1 items-center'}>
            <span className="mr-1">{passed ? <img src={green} alt="" />: <img src={tick} alt="" />}</span>
            {req.label}
          </li>
        );
      })}
    </ul>
  </div>
);

export default PasswordRequirements;
