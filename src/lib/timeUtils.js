// Time utilities for timezone conversions and slot classification

// Convert an ISO-like time string (UTC) to a Date in IST (UTC+5:30)
export const toISTDate = (iso) => {
  const d = new Date(iso);
  // Create a new date shifted by IST offset
  const istOffsetMin = 330; // 5.5 hours
  const utc = d.getTime() + (d.getTimezoneOffset() * 60 * 1000);
  return new Date(utc + istOffsetMin * 60 * 1000);
};

// Format hh:mm AM/PM in IST
export const formatISTTime = (iso) => {
  const d = toISTDate(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Classify a slot into day parts by IST start time
// Morning: 06:00-12:00, Afternoon: 12:00-16:00, Evening: 16:00-20:00, Night: 20:00-24:00
export const classifyISTDayPart = (isoStart) => {
  const d = toISTDate(isoStart);
  const h = d.getHours();
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 16) return 'afternoon';
  if (h >= 16 && h < 20) return 'evening';
  if (h >= 20 || h < 6) return 'night';
  return 'misc';
};

// Build label like "10:00am-12:30pm" from start/end
export const buildISTRangeLabel = (startIso, endIso) => {
  const a = formatISTTime(startIso).toLowerCase();
  const b = formatISTTime(endIso).toLowerCase();
  return `${a}-${b}`;
};

// Calculate age in years from a date string
export const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};
