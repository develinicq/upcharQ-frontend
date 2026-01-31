import * as React from "react";
const SvgTextColor = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m6 14 6-12 6 12M8.25 9.8h7.5"
    />
    <rect width={20} height={7} x={2} y={15} fill="#0D47A1" rx={2} />
  </svg>
);
export default SvgTextColor;
